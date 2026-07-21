const url = "https://localhost:7126/api/Rubro"; // Cambiá el puerto si es otro

let modalRubro;

//==============================
// OBTENER RUBROS
//==============================
async function ObtenerRubros() {

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Error al obtener los rubros");
        }

        const data = await response.json();

        let html = "";

        data.forEach(rubro => {

            html += `
                <tr>
                    <td>${rubro.rubroId}</td>
                    <td>${rubro.descripcion}</td>

                    <td>
                        <button class="btn btn-warning btn-sm"
                            onclick="AbrirModalEditarRubro(${rubro.rubroId})">
                            Editar
                        </button>
                    </td>

                    <td>
                        <button class="btn btn-danger btn-sm"
                            onclick="EliminarRubro(${rubro.rubroId})">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;

        });

        document.getElementById("TodosLosRubros").innerHTML = html;

    }
    catch (error) {
        console.error(error);
    }

}

//==============================
// MODAL CREAR
//==============================
function AbrirModalCrearRubro() {

    document.getElementById("TituloModalRubro").innerHTML = "Crear Rubro";

    document.getElementById("RubroId").value = "";
    document.getElementById("Descripcion").value = "";

    modalRubro = new bootstrap.Modal(document.getElementById("ModalRubro"));
    modalRubro.show();

}

//==============================
// MODAL EDITAR
//==============================
async function AbrirModalEditarRubro(id) {

    const response = await fetch(`${url}/${id}`);
    const rubro = await response.json();

    document.getElementById("TituloModalRubro").innerHTML = "Editar Rubro";

    document.getElementById("RubroId").value = rubro.rubroId;
    document.getElementById("Descripcion").value = rubro.descripcion;

    modalRubro = new bootstrap.Modal(document.getElementById("ModalRubro"));
    modalRubro.show();

}

//==============================
// GUARDAR
//==============================
async function GuardarRubro() {

    const descripcion = document.getElementById("Descripcion").value.trim().toUpperCase();

    if (!descripcion) {
        Swal.fire({
            icon: "warning",
            title: "Falta la descripción",
            text: "La descripción del rubro es obligatoria.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    const id = document.getElementById("RubroId").value;

    const rubro = {

        rubroId: id == "" ? 0 : parseInt(id),
        descripcion: descripcion

    };

    let response;

    if (id == "") {

        response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(rubro)
        });

    } else {

        response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(rubro)
        });

    }

    if (response.ok) {

        modalRubro.hide();

        Swal.fire({
            icon: "success",
            title: "Guardado correctamente",
            timer: 1500,
            showConfirmButton: false
        });

        ObtenerRubros();

    } else {

        Swal.fire("Error", "No se pudo guardar", "error");

    }

}

//==============================
// ELIMINAR
//==============================
async function EliminarRubro(id) {

    const resultado = await Swal.fire({
        title: "¿Eliminar Rubro?",
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
            title: "Rubro eliminado",
            timer: 1500,
            showConfirmButton: false
        });

        ObtenerRubros();

    } else {

        Swal.fire("Error", "No se pudo eliminar", "error");

    }

}