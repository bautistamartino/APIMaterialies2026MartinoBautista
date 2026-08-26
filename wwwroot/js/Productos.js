const url = "https://localhost:7126/api/Productos"; // Cambiá el puerto si es necesario
const materialUrl = "https://localhost:7126/api/Materiales";
const composicionUrl = "https://localhost:7126/api/MaterialesProductos";

let modalProducto;
let modalComposicionProducto;
let materialesSeleccionados = [];
let materialesDisponibles = [];

//==================================
// OBTENER PRODUCTOS
//==================================
async function ObtenerProductos() {

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Error al obtener los productos");
        }

        const data = await response.json();

        let html = "";

        data.forEach(producto => {

            html += `
                <tr>
                    <td>${producto.productoId}</td>
                    <td>${producto.descripcion}</td>
                    <td>${producto.precioCosto?.toFixed(2) ?? "0.00"}</td>
                    <td>${producto.precioVenta?.toFixed(2) ?? "0.00"}</td>
                    <td>
                        <button class="btn btn-warning btn-sm"
                            onclick="AbrirModalEditarProducto(${producto.productoId})">
                            Editar
                        </button>
                    </td>

                    <td>
                        <button class="btn btn-danger btn-sm"
                            onclick="EliminarProducto(${producto.productoId})">
                            Eliminar
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm"
                            onclick="ComposicionProducto(${producto.productoId})">
                            Composicion
                        </button>
                    </td>
                </tr>
            `;

        });

        document.getElementById("TodosLosProductos").innerHTML = html;

    }
    catch (error) {
        console.error(error);
    }

}

//==================================
// MODAL CREAR
//==================================
function AbrirModalCrearProducto() {

    document.getElementById("TituloModalProducto").innerHTML = "Crear Producto";

    document.getElementById("ProductoId").value = "";
    document.getElementById("Descripcion").value = "";

    modalProducto = new bootstrap.Modal(document.getElementById("ModalProducto"));
    modalProducto.show();

}

//==================================
// MODAL EDITAR
//==================================
async function AbrirModalEditarProducto(id) {

    const response = await fetch(`${url}/${id}`);
    const producto = await response.json();

    document.getElementById("TituloModalProducto").innerHTML = "Editar Producto";

    document.getElementById("ProductoId").value = producto.productoId;
    document.getElementById("Descripcion").value = producto.descripcion;
    document.getElementById("PrecioCosto").value = producto.precioCosto;
    document.getElementById("PorcentajeGanancia").value = producto.porcentajeGanancia;
    document.getElementById("PrecioVenta").value = producto.precioVenta;

    modalProducto = new bootstrap.Modal(document.getElementById("ModalProducto"));
    modalProducto.show();

}

//==================================
// GUARDAR
//==================================
async function GuardarProducto() {

    const descripcion = document.getElementById("Descripcion").value.trim().toUpperCase();

    if (!descripcion) {
        Swal.fire({
            icon: "warning",
            title: "Falta la descripción",
            text: "La descripción del producto es obligatoria.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    const id = document.getElementById("ProductoId").value;

    const producto = {
        productoId: id == "" ? 0 : parseInt(id),
        descripcion: descripcion
    };

    let response;

    if (id == "") {

        response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(producto)
        });

    } else {

        response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(producto)
        });

    }

    if (response.ok) {

        modalProducto.hide();

        Swal.fire({
            icon: "success",
            title: "Guardado correctamente",
            timer: 1500,
            showConfirmButton: false
        });

        ObtenerProductos();

    } else {

        Swal.fire("Error", "No se pudo guardar", "error");

    }

}

//==================================
// ELIMINAR
//==================================
async function EliminarProducto(id) {

    const resultado = await Swal.fire({
        title: "¿Eliminar Producto?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "Cancelar"
    });

    if (!resultado.isConfirmed)
        return;

    const response = await fetch(`${url}/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {

        Swal.fire({
            icon: "success",
            title: "Producto eliminado",
            timer: 1500,
            showConfirmButton: false
        });

        ObtenerProductos();

    } else {

        Swal.fire("Error", "No se pudo eliminar", "error");

    }

}

async function ComposicionProducto(id) {

    const response = await fetch(`${url}/${id}`);
    const producto = await response.json();

    document.getElementById("ProductoIdComposicion").value = producto.productoId;
    document.getElementById("DescripcionComposicion").value = producto.descripcion;
    document.getElementById("CantidadMaterial").value = "";

    materialesDisponibles = await CargarMateriales();
    materialesSeleccionados = [];

    const responseComposicion = await fetch(`${composicionUrl}/producto/${id}`);
    if (responseComposicion.ok) {
        const composicion = await responseComposicion.json();

        materialesSeleccionados = composicion.map(item => {
            const material = materialesDisponibles.find(m => String(m.materialId) === String(item.materialId));
            return {
                materialId: item.materialId,
                descripcion: material?.descripcion || item.descripcion || "Sin descripción",
                cantidad: parseFloat(item.cantidad),
                precioCosto: parseFloat(item.precioCostoUnitario ?? item.precioCosto ?? 0),
                subtotal: parseFloat(item.subtotal ?? 0)
            };
        });
    }

    renderMaterialesSeleccionados();

    modalComposicionProducto = new bootstrap.Modal(document.getElementById("ModalComposicionProducto"));
    modalComposicionProducto.show();
}

async function CargarMateriales(materialSeleccionado = null) {
    const select = document.getElementById("MaterialId");

    if (!select) return [];

    select.innerHTML = '<option value="">Seleccione un material </option>';

    try {
        const response = await fetch(materialUrl);

        if (!response.ok) {
            throw new Error("Error al obtener los materiales");
        }

        const data = await response.json();

        data.forEach(material => {
            const option = document.createElement("option");
            option.value = material.materialId;
            option.textContent = material.descripcion || "Sin descripción";

            if (materialSeleccionado !== null && String(material.materialId) === String(materialSeleccionado)) {
                option.selected = true;
            }

            select.appendChild(option);
        });

        materialesDisponibles = data;
        return data;

    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">No hay materiales cargados</option>';
        materialesDisponibles = [];
        return [];
    }
}

function renderMaterialesSeleccionados() {
    const tbody = document.getElementById("tablaMateriales");
    const totalCosto = document.getElementById("TotalCosto");

    if (!tbody || !totalCosto) return;

    let html = "";
    let total = 0;

    materialesSeleccionados.forEach((item, index) => {
        const subtotal = parseFloat(item.subtotal || 0);
        total += subtotal;

        html += `
            <tr>
                <td>${item.descripcion}</td>
                <td>${item.cantidad}</td>
                <td>$ ${item.precioCosto.toFixed(2)}</td>
                <td>$ ${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="EliminarMaterialSeleccionado(${index})">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    totalCosto.innerText = `$ ${total.toFixed(2)}`;
}

function EliminarMaterialSeleccionado(index) {
    materialesSeleccionados.splice(index, 1);
    renderMaterialesSeleccionados();
}

async function AgregarMaterial() {
    const select = document.getElementById("MaterialId");
    const cantidadInput = document.getElementById("CantidadMaterial");

    if (!select || !cantidadInput) return;

    const materialId = select.value;
    const cantidad = parseFloat(cantidadInput.value);

    if (!materialId) {
        Swal.fire({
            icon: "warning",
            title: "Falta seleccionar material",
            text: "Seleccione un material para agregar.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    if (isNaN(cantidad) || cantidad <= 0) {
        Swal.fire({
            icon: "warning",
            title: "Cantidad inválida",
            text: "Ingrese una cantidad mayor a cero.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    if (!materialesDisponibles.length) {
        materialesDisponibles = await CargarMateriales();
    }

    const material = materialesDisponibles.find(m => String(m.materialId) === String(materialId));

    if (!material) {
        Swal.fire({
            icon: "error",
            title: "Material no encontrado",
            text: "No se pudo encontrar el material seleccionado.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    const existe = materialesSeleccionados.find(m => String(m.materialId) === String(materialId));

    if (existe) {
        existe.cantidad += cantidad;
        existe.subtotal = parseFloat(existe.cantidad) * parseFloat(existe.precioCosto);
    } else {
        materialesSeleccionados.push({
            materialId: material.materialId,
            descripcion: material.descripcion || "Sin descripción",
            cantidad: cantidad,
            precioCosto: parseFloat(material.precioCosto),
            subtotal: parseFloat(material.precioCosto) * cantidad
        });
    }

    renderMaterialesSeleccionados();
    select.value = "";
    cantidadInput.value = "";
}

async function GuardarComposicion() {
    if (materialesSeleccionados.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "No hay materiales agregados",
            text: "Agregue al menos un material antes de guardar.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    const productoId = parseInt(document.getElementById("ProductoIdComposicion").value);
    if (isNaN(productoId) || productoId <= 0) {
        Swal.fire({
            icon: "error",
            title: "Producto inválido",
            text: "No se encontró el producto para guardar la composición.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    const payload = materialesSeleccionados.map(item => ({
        materialId: item.materialId,
        productoId: productoId,
        cantidad: item.cantidad,
        precioCostoUnitario: item.precioCosto,
        subtotal: item.subtotal
    }));

    const response = await fetch(composicionUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        Swal.fire({
            icon: "error",
            title: "Error al guardar la composición",
            text: errorText || "No se pudo guardar la composición.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "Composición guardada",
        timer: 1500,
        showConfirmButton: false
    });

    modalComposicionProducto.hide();
    await ObtenerProductos();
}
