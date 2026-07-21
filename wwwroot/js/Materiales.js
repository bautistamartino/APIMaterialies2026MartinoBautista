const url = "https://localhost:7126/api/Materiales"; // Cambia el puerto si corresponde
const rubroUrl = "https://localhost:7126/api/Rubro";

let modalMaterial;

//===========================
// CARGAR RUBROS
//===========================
async function CargarRubros(rubroSeleccionado = null) {
    const select = document.getElementById("Rubro");

    if (!select) return [];

    select.innerHTML = '<option value="">Seleccione un rubro</option>';

    try {
        const response = await fetch(rubroUrl);

        if (!response.ok) {
            throw new Error("Error al obtener los rubros");
        }

        const data = await response.json();

        data.forEach(rubro => {
            const option = document.createElement("option");
            option.value = rubro.rubroId;
            option.textContent = rubro.descripcion || "Sin descripción";

            if (rubroSeleccionado !== null && String(rubro.rubroId) === String(rubroSeleccionado)) {
                option.selected = true;
            }

            select.appendChild(option);
        });

        return data;

    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">No hay rubros cargados</option>';
        return [];
    }
}

//===========================
// CARGAR TABLA
//===========================
async function ObtenerMateriales() {
    try {
        const rubros = await CargarRubros();
        const response = await fetch(url);
        const data = await response.json();

        let html = "";

        data.forEach(material => {
            const rubro = rubros.find(r => String(r.rubroId) === String(material.rubroId ?? material.rubro));
            const nombreRubro = rubro ? (rubro.descripcion || "Sin descripción") : (material.rubro || "Sin rubro");

            html += `
                <tr>
                    <td>${material.materialId}</td>
                    <td>${material.descripcion}</td>
                    <td>${nombreRubro}</td>
                    <td>$ ${material.precioCosto}</td>

                    <td>
                        <button class="btn btn-warning btn-sm"
                            onclick="AbrirModalEditar(${material.materialId})">
                            Editar
                        </button>
                    </td>

                    <td>
                        <button class="btn btn-danger btn-sm"
                            onclick="EliminarMaterial(${material.materialId})">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

        document.getElementById("TodosLosMateriales").innerHTML = html;

    } catch (error) {
        console.log(error);
    }
}

//===========================
// ABRIR MODAL CREAR
//===========================
async function AbrirModalCrear() {

    document.getElementById("TituloModal").innerHTML = "Crear Material";

    document.getElementById("MaterialId").value = "";
    document.getElementById("Descripcion").value = "";
    document.getElementById("Rubro").value = "";
    document.getElementById("PrecioCosto").value = "";

    await CargarRubros();

    modalMaterial = new bootstrap.Modal(document.getElementById("Modalmaterial"));
    modalMaterial.show();
}

//===========================
// ABRIR MODAL EDITAR
//===========================
async function AbrirModalEditar(id) {

    const response = await fetch(`${url}/${id}`);
    const material = await response.json();

    document.getElementById("TituloModal").innerHTML = "Editar Material";

    document.getElementById("MaterialId").value = material.materialId;
    document.getElementById("Descripcion").value = material.descripcion;
    document.getElementById("PrecioCosto").value = material.precioCosto;

    const rubroSeleccionado = material.rubroId ?? material.rubro;
    await CargarRubros(rubroSeleccionado);

    modalMaterial = new bootstrap.Modal(document.getElementById("Modalmaterial"));
    modalMaterial.show();
}

//===========================
// GUARDAR
//===========================
async function GuardarMaterial() {

    const descripcion = document.getElementById("Descripcion").value.trim().toUpperCase();
    const rubroId = document.getElementById("Rubro").value;
    const precioCosto = document.getElementById("PrecioCosto").value;

    if (!descripcion) {
        Swal.fire({
            icon: "warning",
            title: "Falta la descripción",
            text: "La descripción del material es obligatoria.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    if (!rubroId) {
        Swal.fire({
            icon: "warning",
            title: "Falta el rubro",
            text: "Debe seleccionar un rubro para guardar el material.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    if (precioCosto === "" || isNaN(parseFloat(precioCosto))) {
        Swal.fire({
            icon: "warning",
            title: "Falta el precio",
            text: "El precio costo es obligatorio.",
            confirmButtonText: "Aceptar"
        });
        return;
    }

    const id = document.getElementById("MaterialId").value;

    const material = {

        materialId: id == "" ? 0 : parseInt(id),
        descripcion: descripcion,
        rubroId: parseInt(rubroId),
        precioCosto: parseFloat(precioCosto)

    };

    let response;

    if (id == "") {

        response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(material)
        });

    } else {

        response = await fetch(`${url}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(material)
        });

    }

    if (response.ok) {

        Swal.fire({
            icon: "success",
            title: "Guardado correctamente",
            timer: 1500,
            showConfirmButton: false
        });

        modalMaterial.hide();

        ObtenerMateriales();

    } else {

        Swal.fire("Error", "No se pudo guardar.", "error");

    }

}

//===========================
// ELIMINAR
//===========================
async function EliminarMaterial(id) {

    const resultado = await Swal.fire({
        title: "¿Eliminar?",
        text: "No podrá recuperarse.",
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
            title: "Eliminado",
            timer: 1200,
            showConfirmButton: false
        });

        ObtenerMateriales();

    } else {

        Swal.fire("Error", "No se pudo eliminar.", "error");

    }

}