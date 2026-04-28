/* ============================================
   uploadComponent.js — Reusable Upload UI
   ============================================ */

class UploadComponent {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      accept: options.accept || 'image/*',
      maxSize: options.maxSize || 10 * 1024 * 1024, // 10MB
      onFileSelected: options.onFileSelected || (() => {}),
      label: options.label || 'Drop file here or click to browse'
    };
    this.selectedFile = null;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="upload-area" id="${this.container.id}-drop">
        <div class="upload-icon">📁</div>
        <h3>${this.options.label}</h3>
        <p style="color:var(--muted);font-size:13px">Max size: ${Math.round(this.options.maxSize / 1024 / 1024)}MB</p>
        <input type="file" id="${this.container.id}-input" accept="${this.options.accept}" style="display:none" />
      </div>
      <div id="${this.container.id}-preview" style="display:none;margin-top:12px;text-align:center">
        <p id="${this.container.id}-filename" style="font-size:13px;color:var(--muted)"></p>
        <button onclick="window['${this.container.id}Upload'].clear()" style="font-size:12px;color:var(--danger);background:none;border:none;cursor:pointer;margin-top:4px">✕ Remove</button>
      </div>
    `;
  }

  bindEvents() {
    const dropZone = document.getElementById(`${this.container.id}-drop`);
    const fileInput = document.getElementById(`${this.container.id}-input`);

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) this.handleFile(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) this.handleFile(e.dataTransfer.files[0]);
    });

    // Register globally for inline onclick
    window[`${this.container.id}Upload`] = this;
  }

  handleFile(file) {
    if (file.size > this.options.maxSize) {
      alert(`File too large. Maximum size is ${Math.round(this.options.maxSize / 1024 / 1024)}MB`);
      return;
    }

    this.selectedFile = file;
    document.getElementById(`${this.container.id}-filename`).textContent = `📎 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    document.getElementById(`${this.container.id}-preview`).style.display = 'block';

    this.options.onFileSelected(file);
  }

  clear() {
    this.selectedFile = null;
    document.getElementById(`${this.container.id}-preview`).style.display = 'none';
    document.getElementById(`${this.container.id}-input`).value = '';
  }

  getFile() { return this.selectedFile; }
}
