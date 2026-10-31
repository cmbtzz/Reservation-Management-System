(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const body = document.body;

  const toastRegion = $('.toast-region') || (() => {
    const region = document.createElement('div');
    region.className = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'false');
    body.appendChild(region);
    return region;
  })();

  window.showPrototypeToast = (title, copy = '', tone = '') => {
    const toast = document.createElement('div');
    toast.className = `toast ${tone}`.trim();
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <svg class="icon" aria-hidden="true"><use href="#icon-check-circle"></use></svg>
      <div><div class="toast-title"></div><div class="toast-copy"></div></div>`;
    $('.toast-title', toast).textContent = title;
    $('.toast-copy', toast).textContent = copy;
    toastRegion.appendChild(toast);
    window.setTimeout(() => {
      toast.classList.add('leaving');
      window.setTimeout(() => toast.remove(), 230);
    }, 3200);
  };

  const showView = (target) => {
    const view = document.getElementById(`view-${target}`);
    if (!view) return;
    $$('.view').forEach((item) => item.classList.toggle('active', item === view));
    $$('[data-view-target]').forEach((item) => {
      const active = item.dataset.viewTarget === target;
      item.classList.toggle('active', active);
      if (item.getAttribute('role') === 'tab') item.setAttribute('aria-selected', String(active));
    });
    const sidebar = $('.sidebar');
    const scrim = $('.sidebar-scrim');
    sidebar?.classList.remove('open');
    scrim?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  $$('[data-view-target]').forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.viewTarget));
  });

  const initialTarget = location.hash.replace('#', '');
  if (initialTarget && document.getElementById(`view-${initialTarget}`)) showView(initialTarget);

  const sidebarToggle = $('[data-sidebar-toggle]');
  const sidebar = $('.sidebar');
  const scrim = $('.sidebar-scrim');
  sidebarToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    scrim?.classList.toggle('open');
  });
  scrim?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    scrim.classList.remove('open');
  });

  // Student date and time filters
  $$('.date-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.date-chip').forEach((item) => item.classList.toggle('active', item === chip));
      const label = chip.dataset.dateLabel || chip.textContent.trim();
      const bookingDate = $('[data-booking-date]');
      if (bookingDate) bookingDate.textContent = label;
      window.showPrototypeToast('已切换日期', `正在展示 ${label} 的空闲座位。`);
    });
  });

  $$('.segmented[data-filter-group] button').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest('.segmented');
      $$('button', group).forEach((item) => item.classList.toggle('active', item === button));
      if (group.dataset.filterGroup === 'time') {
        const selectedTime = $('[data-booking-time]');
        if (selectedTime) selectedTime.textContent = button.textContent.trim();
      }
    });
  });

  $$('.room-option').forEach((option) => {
    option.addEventListener('click', () => {
      $$('.room-option').forEach((item) => item.classList.toggle('active', item === option));
      window.showPrototypeToast('自习室已切换', `${option.dataset.roomName || '目标自习室'} 的座位状态已更新。`);
    });
  });

  // Seat selection
  const seatNumber = $('[data-selected-seat]');
  const seatTags = $('[data-selected-tags]');
  const confirmBooking = $('[data-confirm-booking]');

  $$('.seat').forEach((seat) => {
    seat.addEventListener('click', () => {
      if (seat.disabled || seat.classList.contains('occupied') || seat.classList.contains('maintenance')) return;
      $$('.seat.selected').forEach((item) => {
        item.classList.remove('selected');
        item.classList.add('available');
        item.setAttribute('aria-pressed', 'false');
        const label = $('.seat-label', item);
        if (label) label.textContent = item.dataset.seat;
      });
      seat.classList.remove('available');
      seat.classList.add('selected');
      seat.setAttribute('aria-pressed', 'true');
      const label = $('.seat-label', seat);
      if (label) label.textContent = '已选';
      if (seatNumber) seatNumber.innerHTML = `<small>A-</small>${seat.dataset.seat.replace(/^A/, '')}`;
      if (seatTags) {
        const tags = (seat.dataset.tags || '安静区域').split(',');
        seatTags.innerHTML = tags.map((tag) => `<span class="dark-tag">${tag}</span>`).join('');
      }
    });
  });

  confirmBooking?.addEventListener('click', () => {
    if (!seatNumber) return;
    const selected = $('.seat.selected');
    if (!selected) {
      window.showPrototypeToast('请先选择座位', '在平面图中选择一个绿色空闲座位。', 'warn');
      return;
    }
    confirmBooking.textContent = '预约已保留 10:00';
    confirmBooking.disabled = true;
    window.showPrototypeToast('预约成功', `${seatNumber.textContent.trim()} 已加入“我的预约”，请提前 15 分钟签到。`, 'success');
  });

  // Client check-in interaction
  const checkinForm = $('[data-checkin-form]');
  checkinForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const code = $('.code-input', checkinForm)?.value.trim();
    if (!/^\d{6}$/.test(code)) {
      window.showPrototypeToast('签到码格式不正确', '请输入管理员提供的 6 位数字签到码。', 'warn');
      return;
    }
    const status = $('[data-checkin-status]');
    if (status) {
      status.textContent = '已签到';
      status.className = 'pill pill-green';
    }
    window.showPrototypeToast('签到成功', '本次使用已开始，离场时请完成签退。', 'success');
  });

  // Generic demo actions
  $$('[data-toast]').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (button.tagName === 'A') event.preventDefault();
      window.showPrototypeToast(button.dataset.toast, button.dataset.toastCopy || '该操作已在原型中呈现。');
    });
  });

  // Admin chart filters
  $$('.chart-filters button').forEach((button) => {
    button.addEventListener('click', () => {
      $$('button', button.closest('.chart-filters')).forEach((item) => item.classList.toggle('active', item === button));
    });
  });

  // Copy room check-in code
  const copyButton = $('[data-copy-code]');
  copyButton?.addEventListener('click', async () => {
    const code = copyButton.dataset.copyCode || '386204';
    try {
      await navigator.clipboard.writeText(code);
      window.showPrototypeToast('签到码已复制', `${code} 可直接发送给现场管理员。`, 'success');
    } catch {
      window.showPrototypeToast('签到码', `当前签到码为 ${code}。`);
    }
  });

  // Admin row actions shown as working prototype feedback
  $$('[data-handle-violation]').forEach((button) => {
    button.addEventListener('click', () => {
      const row = button.closest('tr');
      const status = row?.querySelector('[data-violation-status]');
      if (status) {
        status.textContent = '已处理';
        status.className = 'pill pill-green';
      }
      button.disabled = true;
      button.textContent = '已处理';
      window.showPrototypeToast('违约记录已处理', '处理结果已写入审计日志。', 'success');
    });
  });
})();