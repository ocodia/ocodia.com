let AutoToc = (element, scope, options) => {

  let tableOfContents = "";
  let opts = Object.assign(AutoToc.defaultOptions, options);
  let rootElement = document.getElementById(element);
  let listStyle = rootElement.tagName.toLowerCase();
  let currentDepth = opts.startLevel;
  let headings = getAllHeadingsInScope();

  addAnchorsToHeadings();
  buildContentList();
  appendTableOfContentsToPlaceholder();

  function appendTableOfContentsToPlaceholder() {
    rootElement.innerHTML = tableOfContents;
  }

  function formatLink(element) {
    const link = document.createElement("a");
    link.href = "#" + element.id;
    link.innerText = element.innerText;
    return link.outerHTML;
  }

  function buildContentList() {
    headings.forEach(
      (heading = (heading, i) => {
        const depth = Number(heading.nodeName.toLowerCase().substr(1, 1));

        if (i > 0 || (i == 0 && depth != currentDepth)) {
          changeDepth(depth);
        }
        tableOfContents += formatLink(heading);
      })
    );

    changeDepth(opts.startLevel, true);

    if (tieredList()) {
      tableOfContents = "<li>\n" + tableOfContents + "</li>\n";
    }

    if (opts.showTopLinks) appendTopLinkToHeadings();
  }

  function tieredList() {
    return listStyle == "ul" || listStyle == "ol";
  }

  function changeDepth(newDepth, last) {
    if (last !== true) last = false;

    if (!tieredList()) {
      currentDepth = newDepth;
      return true;
    }

    // If nested
    if (newDepth > currentDepth) {
      // Add enough opening tags to step into the heading
      // as it is possible that a poorly built document
      // steps from h1 to h3 without an h2
      let openingTags = [];

      for (var i = currentDepth; i < newDepth; i++) {
        openingTags.push("<" + listStyle + ">" + "\n");
      }
      var li = "<li>\n";

      // Add the code to our TOC and an opening LI
      tableOfContents += openingTags.join(li) + li;
    } else if (newDepth < currentDepth) {
      // Close all the loops
      var closingTags = [];
      for (var i = currentDepth; i > newDepth; i--) {
        closingTags.push("</" + listStyle + ">" + "\n");
      }

      // Add closing LI and any additional closing tags
      tableOfContents += "</li>\n" + closingTags.join("</li>" + "\n");

      // Open next block
      if (!last) {
        tableOfContents += "</li>\n<li>\n";
      }
    } else {
      // Depth has not changed
      if (!last) {
        tableOfContents += "</li>\n<li>\n";
      }
    }

    // Store the new depth
    currentDepth = newDepth;
  }

  function addAnchorsToHeadings() {
    headings.forEach((element) => {
      if (!element.getAttribute("id")) {
        let slug = createIdSlug(element.innerText);
        element.setAttribute("id", slug);
      }
    });
  }

  function appendTopLinkToHeadings() {
    let topLink = rootElement.id;
    
    if(opts.topLinkToParentToc == false){ 
      addTopAnchorToBody(); 
      topLink = opts.topBodyId;
    }

    headings.forEach((element) => {
      element.append(appendTopLinkToHeading(topLink));
    });
  }

  function addTopAnchorToBody() {
    let currentBodyId = document.body.getAttribute("id");

    if (currentBodyId) {
      opts.topBodyId = currentBodyId;
    } else {
      document.body.setAttribute("id", opts.topBodyId);
    }
  }

  function appendTopLinkToHeading(topLink) {
    let link = document.createElement("a");
    link.href = "#" + topLink;
    link.setAttribute("class", opts.topLinkClass);
    link.innerHTML = "&uarr;";
    return link;
  }

  function createIdSlug(text) {
    text = text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/gi, "")
      .replace(/ /gi, "-");
    text = text.substr(0, 50);
    return text;
  }

  function getAllHeadingsInScope() {
    let elementsCollection = [];

    if (typeof scope == "undefined" || scope == null) {
      elementsCollection = document.getElementsByTagName("*");
    } else {
      elementsCollection = document
        .getElementById(scope)
        .getElementsByTagName("*");
    }

    let headingCollection = [];

    // Add all h* matching elements to collection
    for (var i = 0, n = elementsCollection.length; i < n; i++) {
      if (/^h\d{1}$/gi.test(elementsCollection[i].nodeName)) {
        const depth = Number(elementsCollection[i].nodeName.toLowerCase().substr(1, 1));
        if (depth >= opts.startLevel) {
          headingCollection.push(elementsCollection[i]);
        }
      }
    }

    return headingCollection;
  }
};

// Expose defaults
AutoToc.defaultOptions = {
  startLevel: 1,
  depth: 3,
  showTopLinks: false,
  topLinkToParentToc: false,
  topLinkClass: "toc-top-link",
  topBodyId: "toc-body-top",
};

