const state = {
  token: localStorage.getItem("maaraz_admin_token") || "",
  products: [],
  categories: [],
  orders: [],
  active: "products",
};
const $ = selector => document.querySelector(selector);
const money = number =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(number);
const escape = (value = "") =>
  String(value).replace(
    /[&<>"]/g,
    char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]
  );
async function api(path, options = {}) {
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(`/api${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "تعذر تنفيذ العملية.");
  }
  return response.status === 204 ? null : response.json();
}
function notify(message, isError = false) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.style.background = isError ? "#9a3f48" : "#2f5e43";
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3200);
}
function showApp() {
  $("#loginView").classList.add("hidden");
  $("#appView").classList.remove("hidden");
  loadData();
}
async function loadData() {
  try {
    [state.products, state.categories, state.orders] = await Promise.all([
      api("/products?sort=newest"),
      api("/categories"),
      api("/orders"),
    ]);
    renderAll();
  } catch (error) {
    if (String(error).includes("401")) logout();
    else notify(error.message, true);
  }
}
function renderAll() {
  renderProducts();
  renderCategories();
  renderOrders();
}
function renderProducts() {
  const search = ($("#productSearch").value || "").toLowerCase();
  const products = state.products.filter(p =>
    `${p.name} ${p.color}`.toLowerCase().includes(search)
  );
  $("#productsCount").textContent = state.products.length;
  $("#lowStockCount").textContent = state.products.filter(
    p => p.stockQuantity < 5
  ).length;
  $("#offersCount").textContent = state.products.filter(
    p => p.isOnOffer
  ).length;
  $("#productsTable").innerHTML = products.length
    ? products
        .map(p => {
          const image =
            p.images.find(i => i.isMainImage)?.imageUrl ||
            p.images[0]?.imageUrl ||
            "";
          return `<tr><td><div class="product-cell"><img src="${escape(image)}" alt=""/><div><b>${escape(p.name)}</b><small>${escape(p.color)}</small></div></div></td><td>${escape(p.categoryNameArabic)}</td><td class="price"><b>${money(p.finalPrice)}</b>${p.isOnOffer ? `<del>${money(p.price)}</del>` : ""}</td><td><div class="inline-stock"><input min="0" type="number" value="${p.stockQuantity}" data-stock="${p.id}"/><button data-action="stock" data-id="${p.id}">حفظ</button></div></td><td>${p.stockQuantity ? '<span class="status ok">متاح</span>' : '<span class="status empty">نفد</span>'}${p.stockQuantity < 5 ? '<span class="flag">مخزون منخفض</span>' : ""}${p.isBestSeller ? '<span class="flag">الأكثر مبيعاً</span>' : ""}${p.isNewArrival ? '<span class="flag">وصل حديثاً</span>' : ""}${p.isOnOffer ? '<span class="flag">عرض</span>' : ""}</td><td><div class="row-actions"><button data-action="edit" data-id="${p.id}">تعديل</button><button class="danger" data-action="delete" data-id="${p.id}">حذف</button></div></td></tr>`;
        })
        .join("")
    : '<tr><td class="empty-row" colspan="6">لا توجد منتجات مطابقة.</td></tr>';
}
function renderCategories() {
  $("#categoriesTable").innerHTML =
    state.categories
      .map(
        c =>
          `<tr><td>${escape(c.nameArabic)}</td><td>${escape(c.nameEnglish)}</td><td>${escape(c.description || "—")}</td><td><div class="row-actions"><button data-category-edit="${c.id}">تعديل</button><button class="danger" data-category-delete="${c.id}">حذف</button></div></td></tr>`
      )
      .join("") ||
    '<tr><td class="empty-row" colspan="4">لا توجد أقسام.</td></tr>';
}
function renderOrders() {
  $("#ordersTable").innerHTML =
    state.orders
      .map(
        o =>
          `<tr><td>${escape(o.customerName)}</td><td dir="ltr">${escape(o.phoneNumber)}</td><td class="order-items">${o.items.map(i => `${escape(i.productName)} × ${i.quantity}`).join("<br/>")}</td><td>${money(o.totalPrice)}</td><td>${new Date(o.orderDate).toLocaleDateString("ar-EG")}</td><td><select class="status-select" data-order-status="${o.id}">${["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(s => `<option ${o.status === s ? "selected" : ""} value="${s}">${{ Pending: "قيد الانتظار", Confirmed: "مؤكد", Shipped: "تم الشحن", Delivered: "تم التسليم", Cancelled: "ملغي" }[s]}</option>`).join("")}</select></td><td><div class="row-actions"><button class="danger" data-order-delete="${o.id}">حذف</button></div></td></tr>`
      )
      .join("") ||
    '<tr><td class="empty-row" colspan="7">لا يوجد سجل طلبات بعد.</td></tr>';
}
function modal(title, body) {
  $("#modalRoot").innerHTML =
    `<div class="modal"><div class="modal-header"><h2>${title}</h2><button class="close" data-close>×</button></div>${body}</div>`;
  $("#modalRoot").classList.remove("hidden");
}
function closeModal() {
  $("#modalRoot").classList.add("hidden");
  $("#modalRoot").innerHTML = "";
}
function productModal(product = null) {
  const p = product || {
    name: "",
    description: "",
    price: "",
    categoryId: state.categories[0]?.id || "",
    color: "",
    stockQuantity: 0,
    isBestSeller: false,
    isNewArrival: true,
    isOnOffer: false,
    discountPrice: "",
  };
  modal(
    product ? "تعديل منتج" : "إضافة منتج",
    `<form id="productForm"><div class="form-grid"><label>اسم المنتج<input name="name" value="${escape(p.name)}" required /></label><label>القسم<select name="categoryId" required>${state.categories.map(c => `<option value="${c.id}" ${c.id === p.categoryId ? "selected" : ""}>${escape(c.nameArabic)}</option>`).join("")}</select></label><label class="wide">الوصف<textarea name="description" rows="3" required>${escape(p.description)}</textarea></label><label>السعر بالجنيه<input type="number" min="0.01" step="0.01" name="price" value="${p.price}" required /></label><label>اللون<input name="color" value="${escape(p.color)}" required /></label><label>كمية المخزون<input type="number" min="0" name="stockQuantity" value="${p.stockQuantity}" required /></label><label>رفع صور جديدة<input type="file" name="files" accept=".jpg,.jpeg,.png,.webp" multiple /></label></div><div class="checkboxes"><label><input type="checkbox" name="isBestSeller" ${p.isBestSeller ? "checked" : ""}/> الأكثر مبيعاً</label><label><input type="checkbox" name="isNewArrival" ${p.isNewArrival ? "checked" : ""}/> وصل حديثاً</label><label><input type="checkbox" name="isOnOffer" ${p.isOnOffer ? "checked" : ""}/> ضمن العروض</label></div><label id="discountGroup" ${p.isOnOffer ? "" : 'style="display:none"'}>سعر العرض<input type="number" min="0.01" step="0.01" name="discountPrice" value="${p.discountPrice || ""}" /></label><div class="modal-actions"><button class="secondary" type="button" data-close>إلغاء</button><button class="primary" type="submit">${product ? "حفظ التعديل" : "إضافة المنتج"}</button></div></form>`
  );
  $("#productForm [name=isOnOffer]").addEventListener(
    "change",
    event =>
      ($("#discountGroup").style.display = event.target.checked ? "" : "none")
  );
  $("#productForm").addEventListener("submit", event =>
    saveProduct(event, product?.id)
  );
}
async function saveProduct(event, id) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const body = {
    name: data.name,
    description: data.description,
    price: Number(data.price),
    categoryId: Number(data.categoryId),
    color: data.color,
    stockQuantity: Number(data.stockQuantity),
    isBestSeller: form.isBestSeller.checked,
    isNewArrival: form.isNewArrival.checked,
    isOnOffer: form.isOnOffer.checked,
    discountPrice: form.isOnOffer.checked ? Number(data.discountPrice) : null,
  };
  try {
    const product = await api(id ? `/products/${id}` : "/products", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    const files = form.querySelector("[name=files]").files;
    if (files.length) {
      const upload = new FormData();
      [...files].forEach(file => upload.append("files", file));
      upload.append("mainImageIndex", "0");
      await api(`/products/${product.id}/images`, {
        method: "POST",
        body: upload,
      });
    }
    closeModal();
    await loadData();
    notify(id ? "تم حفظ المنتج." : "تمت إضافة المنتج.");
  } catch (error) {
    notify(error.message, true);
  }
}
function categoryModal(category = null) {
  const c = category || { nameArabic: "", nameEnglish: "", description: "" };
  modal(
    category ? "تعديل قسم" : "إضافة قسم",
    `<form id="categoryForm"><label>الاسم بالعربية<input name="nameArabic" value="${escape(c.nameArabic)}" required /></label><label>الاسم بالإنجليزية<input name="nameEnglish" value="${escape(c.nameEnglish)}" required /></label><label>الوصف<textarea name="description" rows="3">${escape(c.description || "")}</textarea></label><div class="modal-actions"><button class="secondary" type="button" data-close>إلغاء</button><button class="primary" type="submit">حفظ القسم</button></div></form>`
  );
  $("#categoryForm").addEventListener("submit", async event => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api(category ? `/categories/${category.id}` : "/categories", {
        method: category ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      closeModal();
      await loadData();
      notify("تم حفظ القسم.");
    } catch (error) {
      notify(error.message, true);
    }
  });
}
function orderModal() {
  modal(
    "تسجيل طلب واتساب",
    `<form id="orderForm"><div class="form-grid"><label>اسم العميل<input name="customerName" required /></label><label>رقم الهاتف<input name="phoneNumber" required /></label><label>المنتج<select name="productId" required>${state.products.map(p => `<option value="${p.id}">${escape(p.name)} — ${money(p.finalPrice)}</option>`).join("")}</select></label><label>الكمية<input type="number" name="quantity" min="1" value="1" required /></label><label>الحالة<select name="status"><option value="Pending">قيد الانتظار</option><option value="Confirmed">مؤكد</option><option value="Shipped">تم الشحن</option><option value="Delivered">تم التسليم</option><option value="Cancelled">ملغي</option></select></label></div><div class="modal-actions"><button class="secondary" type="button" data-close>إلغاء</button><button class="primary" type="submit">تسجيل الطلب</button></div></form>`
  );
  $("#orderForm").addEventListener("submit", async event => {
    event.preventDefault();
    const f = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: f.customerName,
          phoneNumber: f.phoneNumber,
          status: f.status,
          items: [
            { productId: Number(f.productId), quantity: Number(f.quantity) },
          ],
        }),
      });
      closeModal();
      await loadData();
      notify("تم تسجيل الطلب.");
    } catch (error) {
      notify(error.message, true);
    }
  });
}
async function updateProductStock(id) {
  const product = state.products.find(p => p.id === id);
  const stockQuantity = Number(
    document.querySelector(`[data-stock="${id}"]`).value
  );
  try {
    await api(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...product,
        stockQuantity,
        categoryId: product.categoryId,
      }),
    });
    await loadData();
    notify("تم تحديث المخزون.");
  } catch (error) {
    notify(error.message, true);
  }
}
function logout() {
  localStorage.removeItem("maaraz_admin_token");
  state.token = "";
  $("#appView").classList.add("hidden");
  $("#loginView").classList.remove("hidden");
}
$("#loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  $("#loginError").textContent = "";
  const f = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const result = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify(f),
    });
    state.token = result.token;
    localStorage.setItem("maaraz_admin_token", result.token);
    showApp();
  } catch (error) {
    $("#loginError").textContent = error.message;
  }
});
$("#logoutButton").addEventListener("click", logout);
$("#productSearch").addEventListener("input", renderProducts);
$("#mainAction").addEventListener("click", () =>
  state.active === "products"
    ? productModal()
    : state.active === "categories"
      ? categoryModal()
      : orderModal()
);
$("#addCategory").addEventListener("click", () => categoryModal());
$("#addOrder").addEventListener("click", orderModal());
document.addEventListener("click", async event => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.close !== undefined) return closeModal();
  if (target.dataset.action === "edit")
    return productModal(
      state.products.find(p => p.id === Number(target.dataset.id))
    );
  if (target.dataset.action === "delete") {
    if (confirm("هل تريدين حذف المنتج؟")) {
      try {
        await api(`/products/${target.dataset.id}`, { method: "DELETE" });
        await loadData();
        notify("تم حذف المنتج.");
      } catch (e) {
        notify(e.message, true);
      }
    }
  }
  if (target.dataset.action === "stock")
    return updateProductStock(Number(target.dataset.id));
  if (target.dataset.categoryEdit) {
    const c = state.categories.find(
      x => x.id === Number(target.dataset.categoryEdit)
    );
    return categoryModal(c);
  }
  if (target.dataset.categoryDelete && confirm("هل تريدين حذف القسم؟")) {
    try {
      await api(`/categories/${target.dataset.categoryDelete}`, {
        method: "DELETE",
      });
      await loadData();
      notify("تم حذف القسم.");
    } catch (e) {
      notify(e.message, true);
    }
  }
  if (target.dataset.orderDelete && confirm("هل تريدين حذف الطلب؟")) {
    try {
      await api(`/orders/${target.dataset.orderDelete}`, { method: "DELETE" });
      await loadData();
      notify("تم حذف الطلب.");
    } catch (e) {
      notify(e.message, true);
    }
  }
});
document.addEventListener("change", async event => {
  if (event.target.dataset.orderStatus) {
    try {
      await api(`/orders/${event.target.dataset.orderStatus}`, {
        method: "PUT",
        body: JSON.stringify({ status: event.target.value }),
      });
      await loadData();
      notify("تم تحديث حالة الطلب.");
    } catch (e) {
      notify(e.message, true);
    }
  }
});
document.querySelectorAll(".nav-link").forEach(button =>
  button.addEventListener("click", () => {
    state.active = button.dataset.view;
    document
      .querySelectorAll(".nav-link")
      .forEach(x => x.classList.toggle("active", x === button));
    document
      .querySelectorAll(".view-pane")
      .forEach(x => x.classList.add("hidden"));
    $(`#${state.active}View`).classList.remove("hidden");
    $("#viewTitle").textContent = {
      products: "المنتجات",
      categories: "الأقسام",
      orders: "الطلبات",
    }[state.active];
    $("#mainAction").textContent = {
      products: "إضافة منتج",
      categories: "إضافة قسم",
      orders: "تسجيل طلب",
    }[state.active];
  })
);
if (state.token) showApp();
