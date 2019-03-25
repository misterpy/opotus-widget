import { makeId } from "./utils";
export class PaymentWidget {
    constructor() {
        this.opotusUrl = "https://localhost:4288/compatibility";
        this.requiredQueryParameters = ["apiKey", "orderId", "amount", "callbackUrl"];
        this.widgetId = `${makeId(8)}_`;
        this.config = {};
    }
    init(config) {
        this.placeholderElement = document.getElementById(config.placeholderId);
        if (!this.placeholderElement) {
            throw new Error("container element not found. " + "please make sure the container element with the correct id is available.");
        }
        this.config = config;
        this.iframeContainerElement = document.createElement("div");
        this.iframeContainerElement.setAttribute("id", `${this.widgetId}opotusWidgetContainer`);
        this.iframeElement = document.createElement("iframe");
        this.iframeElement.id = `${this.widgetId}opotusPaymentWidget`;
        this.iframeElement.src = this.generateIFrameUrl(this.config);
        this.iframeElement.frameBorder = "0";
        this.iframeElement.scrolling = "no";
        this.iframeContainerElement.appendChild(this.iframeElement);
        this.placeholderElement.parentNode.replaceChild(this.iframeContainerElement, this.placeholderElement);
        window.addEventListener("message", event => {
            this.processOpotusEvent(event);
        }, false);
    }
    generateIFrameUrl(config) {
        return `${this.opotusUrl}?${this.encodeQueryData(config)}`;
    }
    encodeQueryData(config) {
        const parametersArray = this.requiredQueryParameters.map(key => {
            if (key === "orderId") {
                return `${key}=${this.getAmount(config.amount)}`;
            }
            return `${key}=${config[key]}`;
        });
        return parametersArray.join("&");
    }
    getAmount(amount) {
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount)) {
            throw new Error("invalid amount given.");
        }
        return parsedAmount * 100;
    }
    processOpotusEvent(event) {
        if (!!event && !!event.data && typeof event.data === "string" && event.data.startsWith("OPOTUS_EVENT")) {
            const eventDataArray = event.data.split("__")[1].split(":::");
            const eventType = eventDataArray[0];
            const payload = JSON.parse(eventDataArray[1]);
            switch (eventType) {
                case "TXN_RESULT":
                    return this.emitTransactionResult(payload);
                case "RESIZE_WIDGET":
                    return this.resizeWidget(payload.width, payload.height);
            }
        }
    }
    emitTransactionResult(transaction) {
        this.config.transactionDoneCallback(transaction);
    }
    resizeWidget(width, height) {
        const margin = 50;
        this.iframeContainerElement.style.width = `${width + margin}px`;
        this.iframeContainerElement.style.height = `${height + margin}px`;
        this.iframeElement.style.width = `${width + margin}px`;
        this.iframeElement.style.height = `${height + margin}px`;
    }
}
