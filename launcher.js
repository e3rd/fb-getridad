//
//
//
// (function (document) {
//
//     // Removing ads in the beginning
//     let feed = document.querySelector("div[role=feed]")
//     remove_ads_from_parent(feed);
//
//     // Remove all new dynamicly added ads
//     feed.addEventListener('DOMNodeInserted', function (event) {
//         if (event.target.querySelectorAll) {
//             remove_ads_from_parent(event.target);
//         }
//     }, false);
//
// })(document);
//
//
// /**
//  *
//  * @param el Element suspicious to be an Ad
//  */
// function remove_ads_from_parent(parent) {
//     let article_class = "._4ikz .o_1labxk4fs4";
//     for (let el of parent.querySelectorAll(article_class)) {
//         let s = el.text.replace(/-/g, "");
//         if (s == "Sponsored") {
//             let parent = el.closest("._3ccb")
//             console.log("Removing ad: " + parent.querySelector("h5 a").text);
//             //parent.remove();
//         }
//     }
// }

// data-visualcompletion

function check_garbage_content(node) {
    console.log('39: node: Checking', node);
    const is_suggested = n => {
        if (n.tagName === "B" && n.textContent.replaceAll("-", "") === "Sponsored") { // "Sposored"
            return true
        } else if (n.textContent.startsWith("Sponsored · Paid for by")) {
            return true
        } else if (!n.children.length) {
            if (n.textContent === "Suggested for You") {
                return true
            }
        }
        for (const sub_node of n.children) {
            if (is_suggested(sub_node)) {
                return true
            }
        }
        return false
    }

    const sss = is_suggested(node)
    if (sss) {
        node.style.opacity = "0.2"
        node.style["margin-left"] = "50px"
        node.style.height = "150px"
        node.style["overflow-y"] = "scroll"
    }
    console.log('55: s: ', sss);
}

const observer = new MutationObserver((records) => {
    records.forEach(record => {
        Array.from(record.addedNodes)
            .filter(n => {
                if (!n.hasAttribute) {
                    console.log('69: n: ', n, records);
                    return false
                }
                return n.hasAttribute("data-pagelet");
            })
            .filter(check_garbage_content)
    })
})

observer.observe(document.body, {childList: true, subtree: true})
Array.from(document.querySelectorAll("data-pagelet")).filter(check_garbage_content)
