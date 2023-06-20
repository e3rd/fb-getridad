/**
 * Determine language
 */
const LANG = {
    "en": {
        "Sponsored": "Sponsored",
        "Sponsored · Paid for by": "Sponsored · Paid for by",
        "Suggested for you": "Suggested for you",
        "Suggested groups": "Suggested groups",
        "Suggested live gaming broadcast": "Suggested live gaming broadcast", // XX not sure with the translation
        "People You May Know": "People You May Know",
        "Friend Requests": "Friend Requests",
        "Videos Just For You": "Reels and short videos",
        "FeedHeader": "Feed of posts", // XX
    },
    "fr": {
        "Sponsored": "Sponsorisé",
        "Sponsored · Paid for by": "Sponsorisé · Financé par",
        "Suggested for you": "Suggestion pour vous",
        "Suggested groups": "Suggested groups", // XX
        "Suggested live gaming broadcast": "Suggested live gaming broadcast", // XX translation wrong
        "People You May Know": "Les gens que vous connaissez", // XX translation wrong
        "Friend Requests": "Friend Requests", // XX
        "Videos Just For You": "Videos Just For You", // XX
        "FeedHeader": "Le feed des posts", // XX
    },
    "cs": {
        "Sponsored": "Sponzorováno",
        "Sponsored · Paid for by": "Sponzorováno · Platí",
        "Suggested for you": "Návrhy pro vás",
        "Suggested groups": "Navrhované skupiny", // XX ?
        "Suggested live gaming broadcast": "Navrhované živé herní vysílání",
        "People You May Know": "Koho možná znáte",
        "Friend Requests": "Friend Requests", // XX
        "Videos Just For You": "Reely a krátká videa",
        "FeedHeader": "Příspěvku v kanálu vybraných příspěvků",
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
    if (n.textContent.startsWith(lang["Sponsored"]))
        return true
    if (n.textContent.startsWith(lang["Sponsored · Paid for by"]))
        return true
    if (!n.children.length) {
        if ([lang["Suggested for you"],
        lang["Suggested live gaming broadcast"],
        lang["Suggested groups"],
        lang["People You May Know"],
        lang["Friend Requests"],
        lang["Videos Just For You"]]
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

    if (n.tagName == "use" && n.openOrClosedShadowRoot)  // only supported in Firefox
    {
        let sr = n.openOrClosedShadowRoot
        if (sr.children.length > 0) {
            if (is_garbage(sr.children[0])) return true;
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
        const n = node.tagName === "DIV" ? node : node.children[0]
        n.style.opacity = "0.2"
        n.style["margin-left"] = "50px"
        n.style.height = "150px"
        n.style["overflow-y"] = "scroll"
    }
}

/**
 * New elements are checked for garbage content
 * @type {MutationObserver}
 */
const observer = new MutationObserver(records =>
    records.forEach(record =>
        Array.from(record.addedNodes)
            .filter(n => {
                // XX sometimes hasAttribute or closest are not functions, catch
                if (
                    n?.hasAttribute("data-pagelet")
                    || n?.parentElement?.tagName === "DIV" && n.parentElement.getAttribute("role") === "feed"
                    || n?.parentElement?.children?.length > 0 && n.parentElement.children[0].tagName === "H3" && n.parentElement.children[0].textContent === lang["FeedHeader"]
                    || n?.parentElement?.parentElement?.children?.length > 0 && n.parentElement.parentElement.children[0].tagName === "H3" && n.parentElement.parentElement.children[0].textContent === lang["FeedHeader"]
                    || n?.closest("div[role=main]")) {
                    return true;
                }
            }).map(check_garbage)))

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
    observer.observe(document.body, { childList: true, subtree: true })

    // Process initial elements
    let posts = Array.from(document.querySelectorAll("data-pagelet"))
    if (posts?.length > 0) {
        // use "data-pagelet"
        console.log("[fb-getridad] using data-pagelet")
        posts.map(check_garbage)
    } else {  // no "data-pagelet" => try div role="feed"
        let divfeed = Array.from(document.getElementsByTagName("DIV")).find((node) => { return node?.getAttribute && node.getAttribute("role") && (node.getAttribute("role") === "feed"); })
        if (divfeed) {
            console.log("[fb-getridad] using div role=feed")
            Array.from(divfeed.children).map(check_garbage)
        }
        else {
            // no "data-pagelet" or div role="feed" => search for a h3 with textContent === lang[FeedHeader]
            let feedheader = Array.from(document.getElementsByTagName("H3")).find((node) => { return node.textContent === lang["FeedHeader"] })
            if (feedheader) {
                console.log("[fb-getridad] using div with a H3 with FeedHeader")
                // if feedheader.parent has > 2 children => it is divfeed and contains posts directly
                // if feedheader.parent has exactly 2 children, they are the feed header and another div that encapsulates all posts
                divfeed = (feedheader.parentElement.childElementCount > 2) ? feedheader.parentElement : feedheader.parentElement.children[1]
                Array.from(divfeed.children).map(check_garbage)
            }
            else console.log("[fb-getridad] failed to find a H3 with FeedHeader")
        }
    }

    return true
}

main()
