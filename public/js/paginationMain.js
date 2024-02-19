function initializePagination(className) {
    let entriesPerPage = 5;
    let currentPage = 1;
    let table = document.querySelector(className);
    let rows = table.querySelectorAll("tbody tr");
    let totalEntries = rows.length;
    let totalPages = Math.ceil(totalEntries / entriesPerPage);
  
    showPage(currentPage);
  
    document
      .getElementById("changeEntry")
      .addEventListener("change", handleEntriesChange);
  
    document
      .getElementById("pagination")
      .addEventListener("click", handlePaginationClick);
  
    document.getElementById("nextBtn").addEventListener("click", handleNextClick);
  
    document.getElementById("prevBtn").addEventListener("click", handlePrevClick);
  
    document
      .getElementById("searchBtn")
      .addEventListener("click", handleSearchClick);
  
    document
      .getElementById("searchKeyword")
      .addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          handleSearchClick();
        }
      });
    document.getElementById("searchKeyword").addEventListener("input", () => {
      handleSearchClick();
    });
  
    function showPage(page) {
      currentPage = page;
      let startIdx = (page - 1) * entriesPerPage;
      let endIdx = startIdx + entriesPerPage;
  
      rows.forEach(function (row, index) {
        row.style.display =
          index >= startIdx && index < endIdx ? "table-row" : "none";
      });
  
      updatePagination(currentPage);
      updateNextPrevButtons(currentPage);
    }
  
    function handleEntriesChange() {
      document.getElementById("noDataMessage").style.display = "none";
      entriesPerPage = parseInt(this.value);
      totalPages = Math.ceil(totalEntries / entriesPerPage);
      showPage(1);
    }
  
    function handlePaginationClick(e) {
      document.getElementById("noDataMessage").style.display = "none";
      if (e.target.tagName === "A") {
        e.preventDefault();
        let clickedPage = parseInt(e.target.dataset.page);
  
        if (clickedPage !== currentPage) {
          showPage(clickedPage);
        }
      }
    }
  
    function handleNextClick() {
      if (currentPage < totalPages) {
        showPage(currentPage + 1);
      }
    }
  
    function handlePrevClick() {
      if (currentPage > 1) {
        showPage(currentPage - 1);
      }
    }
  
    function handleSearchClick() {
      let searchKeyword = document
        .getElementById("searchKeyword")
        .value.toLowerCase();
      if (searchKeyword !== "") {
        filterRows(searchKeyword);
      }
    }
  
    function updatePagination(currentPage) {
      let pagination = document.getElementById("pagination");
      pagination.innerHTML = "";
  
      const maxVisibleButtons = 5;
      const halfMaxVisibleButtons = Math.floor(maxVisibleButtons / 2);
      const startPage = Math.max(1, currentPage - halfMaxVisibleButtons);
      const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
  
      if (startPage > 1) {
        addPageLink(1);
        if (startPage > 2) {
          addEllipsis();
        }
      }
  
      for (let i = startPage; i <= endPage; i++) {
        addPageLink(i);
      }
  
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          addEllipsis();
        }
        addPageLink(totalPages);
      }
      
      function addPageLink(pageNumber) {
        let pageLink = document.createElement("a");
        pageLink.href = "#";
        pageLink.style.marginRight = "10px";
        pageLink.style.padding = "13px";
        pageLink.style.borderRadius = "5px";
        pageLink.style.backgroundColor = "white";
        pageLink.style.textDecoration = "none";
  
        pageLink.textContent = pageNumber;
        pageLink.dataset.page = pageNumber;
        if (pageNumber === currentPage) {
          pageLink.classList.add("active");
          pageLink.style.backgroundColor = "#e6f7ff";
        }
        pagination.appendChild(pageLink);
      }
  
      function addEllipsis() {
        let ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.style.marginRight = "5px";
        pagination.appendChild(ellipsis);
      }
    }
  
    function updateNextPrevButtons(currentPage) {
      document.getElementById("prevBtn").disabled = currentPage === 1;
      document.getElementById("nextBtn").disabled = currentPage === totalPages;
      document.getElementById("prevBtn").classList.remove("d-none");
      document.getElementById("nextBtn").classList.remove("d-none");
    }
  
    function filterRows(searchKeyword) {
      let found = false;
      rows.forEach((row) => {
        let rowText = row.textContent.toLowerCase();
        let isMatch = rowText.indexOf(searchKeyword) !== -1;
        if (isMatch) {
          row.style.display = "table-row";
          found = true;
        } else {
          row.style.display = "none";
        }
      });
  
      if (!found) {
        document.getElementById("noDataMessage").style.display = "block";
        document.getElementById("paginationBtns").style.visibility = "hidden";
      } else {
        document.getElementById("noDataMessage").style.display = "none";
        document.getElementById("paginationBtns").style.visibility = "visible";
      }
    }
  }
  