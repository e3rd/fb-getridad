/**
 * Determine language
 */
const LANG = {
    "en": {
        "Sponsored": "Sponsored",
        "Sponsored · Paid for by": "Sponsored · Paid for by",
        "Suggested for you": "Suggested for you",
        "Suggested live gaming broadcast": "Suggested live gaming broadcast", // XX not sure with the translation
        "People You May Know": "People You May Know",
        "Friend Requests": "Friend Requests",
        "Videos Just For You": "Videos Just For You",
    },
    "fr": {
        "Sponsored": "Sponsorisé",
        "Sponsored · Paid for by": "Sponsorisé · Financé par",
        "Suggested for you": "Suggestion pour vous",
        "Suggested live gaming broadcast": "Suggested live gaming broadcast", // XX translation wrong
        "People You May Know": "Les gens que vous connaissez", // XX translation wrong
        "Friend Requests": "Friend Requests", // XX
        "Videos Just For You": "Videos Just For You", // XX
    },
    "cs": {
        "Sponsored": "Sponzorováno",
        "Sponsored · Paid for by": "Sponzorováno · Platí",
        "Suggested for you": "Návrhy pro vás",
        "Suggested live gaming broadcast": "Navrhované živé herní vysílání",
        "People You May Know": "Koho možná znáte",
        "Friend Requests": "Friend Requests", // XX
        "Videos Just For You": "Sekvence a krátká videa",
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
    // if (n.tagName === "SPAN" && n.style.top === '3em' &&
    //     (Array.from(n.parentElement.querySelectorAll('span')).filter(s => s.style.top !== '3em' && s.style.display !== 'none').map(s => s.textContent).join("").includes(lang["Sponsored"].slice(1))
    //     //    || n.textContent.length === 1 && n.nextElementSibling.textContent.length === 1
    //     )) {
    //     return true
    // } else
    if (n.tagName === "B" && n.textContent.replaceAll("-", "") === lang["Sponsored"])  // "Sponsored"
        return true
    if (n.textContent.startsWith(lang["Sponsored · Paid for by"]))
        return true
    if (!n.children.length) {
        if ([lang["Suggested for you"], lang["Suggested live gaming broadcast"], lang["People You May Know"], lang["Friend Requests"], lang["Videos Just For You"]]
            .includes(n.textContent)) {
            return true
        } else if (n.tagName === "SPAN" && n.textContent === lang["Sponsored"][0]) {
            let siblings = Array.from(n.parentElement.childNodes)
                .filter(n => n.style === undefined || n.style.top !== '3em' && n.style.display !== 'none')
                .map(n => n.textContent)
            return Array.from(lang["Sponsored"]).every(ch => {
                const i = siblings.indexOf(ch);
                siblings = siblings.slice(i);
                return i > -1
            })
        }
    }


	let topflexelements = Array.from(n.getElementsByTagName("SPAN")).filter((span) => {
        return (span?.getAttribute("style")?.includes("display: flex"))
    }).concat(Array.from(n.getElementsByTagName("DIV")).filter((div) => {
        return (div?.getAttribute("style")?.includes("display: flex"))
    }))
    for (let topflexelement of topflexelements) { // has a SPAN with style="display:flex"
        let letters = Array.from(topflexelement.childNodes).filter((div) => {
            return ((Number(window.getComputedStyle(div).getPropertyValue("order")) > 0)
				&& ((Number(window.getComputedStyle(div).getPropertyValue("top").replace("px", "")) < 1))
				&& (window.getComputedStyle(div).getPropertyValue("display") === "block"));
            //return div.computedStyleMap().get("top").value === "auto" && div.computedStyleMap().get("display").value !== "none";
        });

        // check if topflexelement itself contains a letter in its textContent
        let tfecopy = topflexelement.cloneNode(true);
        while (tfecopy.childElementCount) tfecopy.removeChild(tfecopy.firstElementChild);
        if ((tfecopy.textContent !== "") && (tfecopy.getAttribute("style").includes("order:"))) letters.push(tfecopy);  // topflexelement itself contains a letter => add it to letters
        // sort letters by style.order
        let maxorder = -1;
        for (let letter of letters) { // find the letter with the highest flex directive "order:"
            maxorder = Math.max(maxorder, Number(window.getComputedStyle(letter).getPropertyValue("order")))
        }
        // iterate over letters by order and build resulting string
        let result = "";
        for (let i = 0; i <= maxorder; i++) {
            const currletter = letters.find((letter) => {
                return window.getComputedStyle(letter).getPropertyValue("order") == i;
            })
            if (currletter) {
                result += currletter.textContent[0]
            }
        }

        if (result === lang["Sponsored"]) {
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
		if (node.tagName === "DIV")
		{
			node.style.opacity = "0.2"
			node.style["margin-left"] = "50px"
			node.style.height = "150px"
			node.style["overflow-y"] = "scroll"
		}
		else if (node.tagName === "SPAN")
		{
			node.children[0].style.opacity = "0.2"
			node.children[0].style["margin-left"] = "50px"
			node.children[0].style.height = "150px"
			node.children[0].style["overflow-y"] = "scroll"
		}
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
                if ((n?.hasAttribute) && (n.hasAttribute("data-pagelet"))) {
                    return true
                } else if ((n?.parentElement?.tagName === "DIV") && (n.parentElement.getAttribute("role") === "feed")) {
                    return true
                }
                return false
            })
            .map(check_garbage)
    })
})

/**
 * Find the language and start listening
 * @return {boolean}
 */
function main() {
    const lang_tag = document.querySelector("html").getAttribute("lang")
    if (!lang_tag) {
        console.log("[fb-getridad] <html lang> tag returns null");
        return false
    } else if (!(lang_tag in LANG)) {
        console.log(`[fb-getridad] lang ${lang_tag} not supported`);
        return false
    }
    lang = LANG[lang_tag]

    console.log(`[fb-getridad] Startup with lang: '${lang_tag}'`)

    // Start listening for new elements
    observer.observe(document.body, {childList: true, subtree: true})

    // Process initial elements
    if (document.querySelector("data-pagelet")) {
        // use "data-pagelet"
        Array.from(document.querySelectorAll("data-pagelet")).map(check_garbage)
    } else {
        // no "data-pagelet" => find posts manually
        Array.from(document.getElementsByTagName("DIV")).find((node) => {
            if (node?.getAttribute("role") === "feed") {
                Array.from(node.children).map(check_garbage)
                return true
            }
        })
    }

    return true
}

main()
