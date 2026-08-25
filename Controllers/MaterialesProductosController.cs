using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using APIMateriales2026MartinoBautista.models;

namespace APIMateriales2026MartinoBautista.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialesProductosController : ControllerBase
    {
        private readonly Context _context;

        public MaterialesProductosController(Context context)
        {
            _context = context;
        }

        // GET: api/MaterialesProductos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaterialProductos>>> GetMaterialesProductos()
        {
            return await _context.MaterialesProductos.ToListAsync();
        }

        // GET: api/MaterialesProductos/producto/5
        [HttpGet("producto/{productoId}")]
        public async Task<ActionResult<IEnumerable<MaterialProductos>>> GetMaterialesProductosByProducto(int productoId)
        {
            var composicion = await _context.MaterialesProductos
                .Where(mp => mp.ProductoId == productoId)
                .ToListAsync();

            return composicion;
        }

        // POST: api/MaterialesProductos
        [HttpPost]
        public async Task<ActionResult<IEnumerable<MaterialProductos>>> PostMaterialesProductos(List<MaterialProductos> materialesProductos)
        {
            if (materialesProductos == null || materialesProductos.Count == 0)
            {
                return BadRequest("No se recibieron materiales para la composición.");
            }

            var productoId = materialesProductos.First().ProductoId;

            if (materialesProductos.Any(mp => mp.ProductoId != productoId))
            {
                return BadRequest("Todos los materiales deben pertenecer al mismo producto.");
            }

            var existentes = _context.MaterialesProductos.Where(mp => mp.ProductoId == productoId);
            _context.MaterialesProductos.RemoveRange(existentes);

            foreach (var item in materialesProductos)
            {
                if (item.MaterialId <= 0 || item.ProductoId <= 0 || item.Cantidad <= 0 || item.PrecioCostoUnitario <= 0)
                {
                    return BadRequest("Cada material debe tener material, producto, cantidad y precio costo unitario válidos.");
                }

                item.Subtotal = item.Cantidad * item.PrecioCostoUnitario;
            }

            var totalCosto = materialesProductos.Sum(mp => mp.Subtotal);
            var producto = await _context.Productos.FindAsync(productoId);
            if (producto == null)
            {
                return NotFound("Producto no encontrado.");
            }

            producto.CostoTotal = totalCosto;
            _context.MaterialesProductos.AddRange(materialesProductos);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMaterialesProductosByProducto), new { productoId }, materialesProductos);
        }
    }
}
