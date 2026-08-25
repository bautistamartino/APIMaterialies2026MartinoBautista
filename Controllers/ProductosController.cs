using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using APIMateriales2026MartinoBautista.models;

namespace APIMateriales2026MartinoBautista.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly Context _context;

        public ProductosController(Context context)
        {
            _context = context;
        }

        // GET: api/Productos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Productos>>> GetProductos()
        {
            return await _context.Productos.ToListAsync();

        }

        // GET: api/Productos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Productos>> GetProductos(int id)
        {
            var productos = await _context.Productos.FindAsync(id);

            if (productos == null)
            {
                return NotFound();
            }

            return productos;
        }

        // PUT: api/Productos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProductos(int id, Productos productos)
        {
            if (id != productos.ProductoId)
            {
                return BadRequest();
            }

            if (string.IsNullOrWhiteSpace(productos.Descripcion))
            {
                return BadRequest("La descripción del producto es obligatoria.");
            }

            productos.Descripcion = productos.Descripcion.Trim().ToUpperInvariant();

            _context.Entry(productos).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductosExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Productos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Productos>> PostProductos(Productos productos)
        {
            if (string.IsNullOrWhiteSpace(productos.Descripcion))
            {
                return BadRequest("La descripción del producto es obligatoria.");
            }

            productos.Descripcion = productos.Descripcion.Trim().ToUpperInvariant();

            _context.Productos.Add(productos);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProductos", new { id = productos.ProductoId }, productos);
        }

        // DELETE: api/Productos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductos(int id)
        {
            var productos = await _context.Productos.FindAsync(id);
            if (productos == null)
            {
                return NotFound();
            }

            _context.Productos.Remove(productos);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductosExists(int id)
        {
            return _context.Productos.Any(e => e.ProductoId == id);
        }

        // [HttpPost("AgregarMateriales/{id}")]
        [HttpPost("AgregarMateriales")]
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

            _context.MaterialesProductos.AddRange(materialesProductos);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMaterialesProductosByProducto), new { productoId }, materialesProductos);
        }

        [HttpGet("producto/{productoId}")]
        public async Task<ActionResult<IEnumerable<MaterialProductos>>> GetMaterialesProductosByProducto(int productoId)
        {
            var composicion = await _context.MaterialesProductos
                .Where(mp => mp.ProductoId == productoId)
                .ToListAsync();

            return composicion;
        }
    }
}

