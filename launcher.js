/**
 * Determine language
 */
const LANG = {
    "en": {
        "Sponsored": "Sponsored",
        "Sponsored · Paid for by": "Sponsored · Paid for by",
        "Suggested for you": "Suggested for you",
        "Suggested live gaming broadcast": "Suggested live gaming broadcast" // XX not sure with the translation
    },
    "fr": {
        "Sponsored": "Sponsorisé",
        "Sponsored · Paid for by": "Sponsorisé · Financé par",
        "Suggested for you": "Suggestion pour vous",
        "Suggested live gaming broadcast": "Suggested live gaming broadcast" // XX translation wrong
    },
    "cs": {
        "Sponsored": "Sponzorováno",
        "Sponsored · Paid for by": "Sponzorováno · Platí",
        "Suggested for you": "Návrhy pro vás",
        "Suggested live gaming broadcast": "Navrhované živé herní vysílání"
    }

}
const debug = false
let lang = null

/**
 * Check if the given node should be removed
 * @param n
 * @return {boolean}
 */
const is_garbage = n => {
    if (n.tagName === "SPAN" && n.style.top === '3em' &&
        (Array.from(n.parentElement.querySelectorAll('span')).filter(s => s.style.top !== '3em').map(s => s.textContent).join("").includes(lang["Sponsored"].slice(1))
        //    || n.textContent.length === 1 && n.nextElementSibling.textContent.length === 1
        )) {
        return true
    } else if (n.tagName === "B" && n.textContent.replaceAll("-", "") === lang["Sponsored"]) { // "Sponsored"
        return true
    } else if (n.textContent.startsWith(lang["Sponsored · Paid for by"])) {
        return true
    } else if (!n.children.length) {
        if ([lang["Suggested for you"], lang["Suggested live gaming broadcast"]].includes(n.textContent)) {
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
    if (debug) {
        console.log('[fb-getridad] Checking: ', node, is);
    }
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
            .map(check_garbage)
    })
})


function fetch_language() {
    const el = document.querySelector("input[type=search]")
    return el && el.getAttribute("placeholder")
}

function main() {
    const shibboleth = fetch_language()
    //lang = LANG[shibboleth === "Hledejte na Facebooku" ? "cs" : "en"]
    switch (shibboleth) {
        case "Hledejte na Facebooku":
            lang = LANG["cs"]
            break;
        case "Rechercher sur Facebook":
            lang = LANG["fr"]
            break;
        default:
            lang = LANG["en"]
    }

    console.log("[fb-getridad] Startup with lang: ", lang)

// Start listening for new elements
    observer.observe(document.body, {childList: true, subtree: true})

// Process initial elements
    Array.from(document.querySelectorAll("data-pagelet")).filter(check_garbage)
}

setTimeout(() => main(), 500)
