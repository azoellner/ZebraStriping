const {ExtensionCommon} = ChromeUtils.importESModule(
    "resource://gre/modules/ExtensionCommon.sys.mjs"
);

const {ExtensionSupport} = ChromeUtils.importESModule(
    "resource:///modules/ExtensionSupport.sys.mjs"
);

const EXTENSION_ID = "zebra@az";

const FOLDER_TREE = {
    hoverColor: "var(--listbox-hover)",
    oddOrEven: "odd",
    selectedColor: "#C0C0C0",
    zebraColor: "#E0E0E0",
};
const THREAD_TREE = {
    hoverColor: "var(--listbox-hover)",
    oddOrEven: "odd",
    selectedColor: "#D0D0D0",
    zebraColor: "#F0F0F0",
};

const findElementById = (window, elementId) => {
    "use strict";
    // For Thunderbird 115
    for (const browser of window.document.querySelectorAll("browser")) {
        if (browser.contentWindow !== null) {
            const element = browser.contentWindow.document.getElementById(elementId);
            if (element !== null) {
                return element;
            }
        }
    }
    // For Thunderbird 102
    return window.document.getElementById(elementId);
};

// Collect those HTML elements when created, in order to delete them on close
let created_css = [];

const addStyleElementToHeader = (tree) => {
    "use strict";
    const doc = tree.getRootNode();
    const css = doc.createElement("style");
    created_css.push(css);
    doc.head.appendChild(css);
    return css.sheet;
};

const doZebraStriping = (window, elementId, cssRules) => {
    "use strict";
    // Thunderbird 115 takes a while for the HTML elements to load,
    // hence retry until the desired one is found.
    let intervalId = window.setInterval(() => {
        const tree = findElementById(window, elementId);
        if (tree !== null) {
            try {
                const sheet = addStyleElementToHeader(tree);
                for (const rule of cssRules) {
                    sheet.insertRule(rule);
                }
            } catch (error) {
                console.error(error);
            }

            if (intervalId !== undefined) {
                window.clearInterval(intervalId);
                intervalId = undefined;
            }
        }
    }, 1000);
};

this.zebra_az = class extends ExtensionCommon.ExtensionAPI {
    getAPI(context) {
        context.callOnClose(this);
        return {
            zebra_az: {
                init() {
                    ExtensionSupport.registerWindowListener(EXTENSION_ID, {
                        // Before Thunderbird 74, messenger.xhtml was messenger.xul
                        chromeURLs: [
                            "chrome://messenger/content/messenger.xhtml",
                            "chrome://messenger/content/messenger.xul",
                        ],
                        onLoadWindow(window) {
                            doZebraStriping(window, "folderTree", [
                                // The color for selected needs to be enforced for striped lines,
                                // and changed to contrast with striped lines
                                `
li.selected > .container {
    background-color: ${FOLDER_TREE.selectedColor};
}
`,
                                // The color for hovering needs to be changed to contrast with striping
                                `
li:not(.selected) > .container:hover {
    background-color: ${FOLDER_TREE.hoverColor};
}
`,
                                // And here's the zebra striping
                                `
li:nth-child(${FOLDER_TREE.oddOrEven}) > .container {
    background-color: ${FOLDER_TREE.zebraColor};
}
`,
                            ]);
                            doZebraStriping(window, "threadTree", [
                                // The color for selected needs to be enforced for striped lines,
                                // and changed to contrast with striping
                                `
[is="tree-view-table-body"] > tr[is="thread-row"].selected {
    background-color: ${THREAD_TREE.selectedColor};
}
`,
                                // The color for hovering needs to be enforced for striped lines
                                `
[is="tree-view-table-body"] tr[is="thread-row"]:hover {
    background-color: ${THREAD_TREE.hoverColor};
}
`,
                                // And here's the zebra striping
                                `
[is="tree-view-table-body"] tr[is="thread-row"]:nth-child(${THREAD_TREE.oddOrEven}) {
    background-color: ${THREAD_TREE.zebraColor};
}
`,
                            ]);
                        },
                    });
                },
            },
        };
    }

    close() {
        ExtensionSupport.unregisterWindowListener(EXTENSION_ID);
        for (const css of created_css) {
            css.remove();
        }
        created_css = [];
    }
};
