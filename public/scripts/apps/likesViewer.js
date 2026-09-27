const likesViewer = {
    sections: document.querySelectorAll('.detail-item'),
    panel: document.querySelector('.view-details'),
    view(code) {
        this.sections.forEach((section) => section.classList.remove('visible'));
        document.getElementById(`details-${code}`).classList.add('visible');
        this.panel.scrollTop = 0;
    }
}