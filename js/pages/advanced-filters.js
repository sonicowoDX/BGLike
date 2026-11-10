{
    const toggle = document.getElementById("advancedFiltersToggle");
    const panel = document.getElementById("advancedFilters");

    toggle.addEventListener("click", () => {
        panel.hidden = !panel.hidden;
        toggle.setAttribute("aria-expanded", String(!panel.hidden));
    });
}
