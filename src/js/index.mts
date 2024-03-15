import fileSaver from "file-saver";
// import OfflinePluginRuntime from "offline-plugin/runtime";
import swal from "sweetalert";
import Worker from "./worker.js?worker";
import "./../css/style.less";
import "./images.js";

document.addEventListener("DOMContentLoaded", () => {
    const toastMessage = document.getElementById("toastMessage")! as HTMLDivElement;

    // if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
    //     OfflinePluginRuntime.install({
    //         onInstalled: () => {
    //             showToastMessage("Ready for install and use offline", 5000, () => {

    //             });
    //         },
    //         onUpdateReady: () => {
    //             OfflinePluginRuntime.applyUpdate();
    //         },
    //         onUpdated: () => {
    //             showToastMessage("Update installed - Reloading ...", 2000, () => {
    //                 location.reload();
    //             });
    //         }
    //     });
    // }

    const selectInputFileButton = document.getElementById("selectInputFileButton")! as HTMLInputElement;
    selectInputFileButton.addEventListener("change", startConvert);

    const selectInputFolderButton = document.getElementById("selectInputFolderButton")! as HTMLInputElement;
    if (supportsFolderSelect()) {
        selectInputFolderButton.parentElement!.classList.remove("disabled");
        selectInputFolderButton.addEventListener("change", startConvert);
    }

    const experimentalSwitch = document.getElementById("experimentalSwitch")! as HTMLInputElement;
    experimentalSwitch.checked = (localStorage[experimentalSwitch.id] === "true");
    experimentalSwitch.addEventListener("change", () => {
        localStorage[experimentalSwitch.id] = experimentalSwitch.checked;
    });

    const main = document.querySelector("main")!;
    main.addEventListener("dragenter", startConvertDrop);
    main.addEventListener("dragleave", startConvertDrop);
    main.addEventListener("dragover", startConvertDrop);
    main.addEventListener("drop", startConvertDrop);

    let worker: Worker | null = null;

    const logs = document.createElement("ul");
    logs.classList.add("log");

    function showToastMessage(message: string, duration: number, func: () => void): void {
        toastMessage.innerText = message;

        toastMessage.dataset.show = "true";

        toastMessage.addEventListener("click", hide);

        setTimeout(hide, duration);

        function hide(): void {
            toastMessage.removeEventListener("click", hide);

            delete toastMessage.dataset.show;

            func();
        }
    }

    function supportsFolderSelect(): boolean {
        return (
            "webkitdirectory" in HTMLInputElement.prototype &&
            "webkitRelativePath" in File.prototype &&
            !(
                navigator.userAgent.match(/Mobile/i) ||
                (navigator.userAgent.match(/Safari/i) && "standalone" in navigator) // iPadOS
            ));
    }

    async function startConvert(this: HTMLInputElement | DataTransfer): Promise<void> {
        const files = this.files!;

        if (files.length === 0) {
            return;
        }

        logs.innerHTML = "";

        swal({
            title: "Conversion in progress",
            content: logs,
            buttons: {
                save: {
                    text: "Save",
                    className: "swal-button--loading"
                }
            },
            closeOnClickOutside: false,
            closeOnEsc: false
        });
        document.querySelector<HTMLButtonElement>(".swal-button--loading")!.disabled = true;

        try {
            if (worker !== null) {
                worker.terminate();
                worker = null;
            }
            worker = new Worker();
            worker.addEventListener("message", afterConvert);
            worker.addEventListener("error", errorConvert);
            worker.postMessage({
                files,
                options: {
                    experimental: experimentalSwitch.checked
                }
            });
        } catch (err) {
            errorConvert(err);
            throw err;
        }
    }

    async function startConvertDrop(this: HTMLElement, e: DragEvent): Promise<void> {
        e.preventDefault();

        this.classList.remove("dragover");

        switch (e.type) {
            case "dragenter":
            case "dragover":
                this.classList.add("dragover");
                break;

            case "drop":
                return startConvert.call(e.dataTransfer!);

            default:
                break;
        }
    }

    async function afterConvert(e: MessageEvent): Promise<void> {
        const { log, log_color_class, output } = e.data;

        if (log) {
            _log(log, log_color_class);
            return;
        }

        // Allow select same file again
        selectInputFileButton.value = selectInputFolderButton.value = "";

        const savePopup = swal({
            title: "Conversion was successful",
            content: logs,
            icon: "success",
            //buttons: ["zip", "mcpack"]
            buttons: "Save"
        });

        _log();

        if (await savePopup) {
            if (output instanceof File) {
                fileSaver(output);
            } else {
                // TODO: Bug iOS `File` is undefined in worker?
                fileSaver(output.data, output.name);
            }
        }
    }

    function errorConvert(err: ErrorEvent): void {
        // Allow select same file again
        selectInputFileButton.value = selectInputFolderButton.value = "";

        swal({
            title: "Conversion failed",
            content: logs,
            icon: "error"
        });

        _log(`ERROR: ${err.message}`, "red");
    }

    function _log(log?: string, log_color_class?: string): void {
        if (log) {
            const li = document.createElement("li");

            li.innerText = log;

            if (log_color_class) {
                li.classList.add(`${log_color_class}-text`, "text-darken-3");
            }

            logs.appendChild(li);
        }

        logs.scrollTop = logs.scrollHeight; // Scroll to bottom
    }
});