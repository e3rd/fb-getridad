/**
 * Determine language
 */
const LANG = {
    "en": {
        "Sponsored": "Sponsored",
        "Sponsored · Paid for by": "Sponsored · Paid for by",
        "Suggested for You": "Suggested for You"
    },
    "cs": {
        "Sponsored": "Sponzorováno",
        "Sponsored · Paid for by": "Sponzorováno · Platí",
        "Suggested for You": "Návrhy pro vás"
    }
}
const shibboleth = document.querySelector("input[type=search]").getAttribute("placeholder")
const lang = LANG[shibboleth === "Hledejte na Facebooku" ? "cs" : "en"]

/**
 * Check if the given node should be removed
 * @param n
 * @return {boolean}
 */
const is_garbage = n => {
    if (n.tagName === "B" && n.textContent.replaceAll("-", "") === lang["Sponsored"]) { // "Sposored"
        return true
    } else if (n.textContent.startsWith(lang["Sponsored · Paid for by"])) {
        return true
    } else if (!n.children.length) {
        if (n.textContent === lang["Suggested for You"]) {
            return true
        }
    }
    for (const sub_node of n.children) {
        if (is_garbage(sub_node)) {
            return true
        }
    }
    return false
}

/**
 * Make given node invisible if evaluated as garbage
 * @param node
 */
function check_garbage(node) {
    const is = is_garbage(node)
    // console.log('Checking: ', node, is);
    if (is) {
        node.style.opacity = "0.2"
        node.style["margin-left"] = "50px"
        node.style.height = "150px"
        node.style["overflow-y"] = "scroll"
    }
}

/**
 * New elements are checked for garbage content
 * @type {MutationObserver}
 */
const observer = new MutationObserver((records) => {
    records.forEach(record => {
        Array.from(record.addedNodes)
            .filter(n => {
                if (!n.hasAttribute) {
                    // console.log('69: n: ', n, records);
                    return false
                }
                return n.hasAttribute("data-pagelet");
            })
            .filter(check_garbage)
    })
})

// Start listening for new elements
observer.observe(document.body, {childList: true, subtree: true})

// Process initial elements
Array.from(document.querySelectorAll("data-pagelet")).filter(check_garbage)
