(() => {
  let advices = [];
  try {
    const stored = localStorage.getItem('advices_v1');
    if (stored) advices = JSON.parse(stored);
  } catch (e) {
    console.error("Failed to read from localStorage", e);
  }

  let editingId = null;

  const wall = document.getElementById('wall');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const adviceInput = document.getElementById('advice-input');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const fab = document.getElementById('fab');

  const cardColors = [
    '#fdf8e1',
    '#f9f1d0',
    '#fefce8'
  ];

  function getColor(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    return cardColors[Math.abs(hash) % cardColors.length];
  }

  function getFontOptions(text) {
    const len = text.trim().length;
    if (len < 50) return { size: 1.8, weight: 700 };
    if (len < 100) return { size: 1.4, weight: 600 };
    if (len < 180) return { size: 1.1, weight: 600 };
    return { size: 0.95, weight: 400 };
  }

  function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }

  const icons = {
    edit: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
    trash: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`
  };

  const collectionCountEl = document.getElementById('collection-count');

  function render() {
    wall.innerHTML = '';
    if (collectionCountEl) {
      collectionCountEl.textContent = `${advices.length} Reflection${advices.length !== 1 ? 's' : ''} Collected`;
    }

    if (advices.length === 0) {
      wall.style.setProperty('--wall-column-count', '1');
      wall.innerHTML = `
        <div class="empty-state">
          <h1>A Blank Canvas</h1>
          <p>Click the + button to add your first piece of advice.</p>
        </div>
      `;
      return;
    }

    wall.style.setProperty('--wall-column-count', '');

    advices.forEach(advice => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.setProperty('--card-bg-color', getColor(advice.id));

      const textEl = document.createElement('div');
      textEl.className = 'text';
      const opts = getFontOptions(advice.text);
      textEl.style.setProperty('--text-font-size', opts.size + 'rem');
      textEl.style.setProperty('--text-font-weight', opts.weight);
      textEl.innerHTML = escapeHTML(advice.text);

      const actions = document.createElement('div');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.innerHTML = icons.edit;
      editBtn.title = 'Edit';
      editBtn.onclick = () => openModal(advice.id);

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn delete';
      delBtn.innerHTML = icons.trash;
      delBtn.title = 'Double-click to delete';
      delBtn.ondblclick = () => {
        advices = advices.filter(a => a.id !== advice.id);
        saveAndRender();
      };

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      card.appendChild(textEl);
      card.appendChild(actions);
      wall.appendChild(card);
    });
  }

  function saveAndRender() {
    try {
      localStorage.setItem('advices_v1', JSON.stringify(advices));
    } catch(e) {
      console.error('Failed to save', e);
    }
    render();
  }

  function openModal(id = null) {
    editingId = id;
    if (id) {
      const ad = advices.find(a => a.id === id);
      adviceInput.value = ad ? ad.text : '';
      modalTitle.textContent = 'Edit Entry';
    } else {
      adviceInput.value = '';
      modalTitle.textContent = 'New Entry';
    }
    modalOverlay.classList.add('active');

    requestAnimationFrame(() => {
      adviceInput.focus();
      adviceInput.selectionStart = adviceInput.selectionEnd = adviceInput.value.length;
    });
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    editingId = null;
    adviceInput.value = '';
    adviceInput.blur();
  }

  function saveAdvice() {
    const text = adviceInput.value.trim();
    if (!text) return;

    if (editingId) {
      const index = advices.findIndex(a => a.id === editingId);
      if (index !== -1) {
        advices[index].text = text;
      }
    } else {
      advices.push({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        text: text,
        createdAt: Date.now()
      });
    }
    closeModal();
    saveAndRender();
  }

  fab.onclick = () => openModal();
  cancelBtn.onclick = closeModal;
  saveBtn.onclick = saveAdvice;

  modalOverlay.onmousedown = (e) => {
    if (e.target === modalOverlay) closeModal();
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && modalOverlay.classList.contains('active')) {
      saveAdvice();
    }
  });

  render();
})();
