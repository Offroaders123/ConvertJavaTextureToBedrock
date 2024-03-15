import { AbstractLog, ArrayInput, FileInputEntry, FileOutput } from "@modifiedcommand/convert-base-api";
import { ConvertJavaTextureToBedrockApi } from "@modifiedcommand/convert-minecraft-java-texture-to-bedrock-api";

addEventListener("message", async e => {
    try {
        const { files, options } = e.data;

        const output = {
            output: await new ConvertJavaTextureToBedrockApi(
                new ArrayInput(Array.prototype.map.call(files, file => new FileInputEntry(file))),
                new FileOutput(),
                new class extends AbstractLog {
                    /**
                     * @inheritDoc
                     *
                     * @param {string|undefined} log_color_class
                     */
                    log(log, log_color_class = undefined) {
                        postMessage({ log, log_color_class })
                    }

                    /**
                     * @inheritDoc
                     */
                    warn(log) {
                        this.warnCount();

                        this.log(`WARNING: ${log}`, "yellow");
                    }
                }(),
                options
            ).convert()
        };

        postMessage(output);
    } catch (err) {
        // https://stackoverflow.com/questions/39992417/how-to-bubble-a-web-worker-error-in-a-promise-via-worker-onerror#answer-40081158
        setTimeout(() => {
            throw err;
        })
    }
});