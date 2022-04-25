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
        "Videos Just For You": "Videos Just For You", // XX
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
        if ([lang["Suggested for you"], lang["Suggested live gaming broadcast"], lang["People You May Know"], lang["Friend Requests"]]
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
	
	let topflexspans = Array.from(n.getElementsByTagName("SPAN")).filter( (span) => { return (span.hasAttribute && span.hasAttribute("style") && span.getAttribute("style").includes("display: flex")); } )
	if (topflexspans.length > 0)  // has a SPAN with style="display:flex"
	{
		for (let index = 0; index < topflexspans.length; index++)
		{
			let letters = Array.from(topflexspans[index].childNodes).filter((span) => { return span.hasAttribute && span.hasAttribute("style") && span.getAttribute("style").includes("order:") });
			
			// check if topflexspan itself contains a letter in its textContent
			let tfscopy = topflexspans[index].cloneNode(true);
			while (tfscopy.childElementCount) tfscopy.removeChild(tfscopy.firstElementChild);
			if ((tfscopy.textContent !== "") && (tfscopy.getAttribute("style").includes("order:"))) letters.push(tfscopy);  // topflexspan itself contains a letter => add it to letters
			// sort letters by style.order
			let maxorder = -1;
			for (let i = 0; i < letters.length; i++)  // find the letter with the highest flex directive "order:"
			{
				let stylewords = letters[i].getAttribute("style").split(" ");
				let thislettersorder = Number(stylewords[stylewords.indexOf("order:") + 1].replace(";", ""));
				if (thislettersorder > maxorder) maxorder = thislettersorder;
			}
			// iterate over letters by order and build resulting string
			let result = "";
			for (let i = 0; i <= maxorder; i++)
			{
				let currletter = letters.find( (span) => { return (span.getAttribute && span.getAttribute("style").includes("order: " + i + ";")); } );
				if (currletter) result = result + currletter.textContent[0];
			}
			
			if (result === lang["Sponsored"]) return true;
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

/**
 * Find the language and start listening
 * @return {boolean}
 */
function main() {
    const lang_tag = document.querySelector("html").getAttribute("lang")
    if (!lang_tag) {
        console.log("[fb-getridad] <html lang> tag returns null");
        return false
    } else if(!(lang_tag in LANG)) {
        console.log(`[fb-getridad] lang ${lang_tag} not supported`);
        return false
    }
    lang = LANG[lang_tag]

    console.log(`[fb-getridad] Startup with lang: '${lang_tag}'`)

    // Start listening for new elements
    observer.observe(document.body, {childList: true, subtree: true})

    // Process initial elements
    Array.from(document.querySelectorAll("data-pagelet")).filter(check_garbage)
    return true
}

main()
