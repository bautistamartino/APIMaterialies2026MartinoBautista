const url = "https://localhost:7126/api/Productos"; // Cambiá el puerto si es necesario

let modalProducto;

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