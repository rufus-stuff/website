const likesViewer = {
    sections: document.querySelectorAll('.detail-item'),
    view(code) {
        this.sections.forEach((section) => section.classList.remove('visible'));
        document.getElementById(`details-${code}`).classList.add('visible');
    }
}