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
    public class MaterialesController : ControllerBase
    {
        private readonly Context _context;

        public MaterialesController(Context context)
        {
            _context = context;
        }

        // GET: api/Materiales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Materiales>>> GetMateriales()
        {
            return await _context.Materiales.ToListAsync();
        }

        // GET: api/Materiales/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Materiales>> GetMateriales(int id)
        {
            var materiales = await _context.Materiales.FindAsync(id);

            if (materiales == null)
            {
                return NotFound();
            }

            return materiales;
        }

        // PUT: api/Materiales/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMateriales(int id, Materiales materiales)
        {
            if (id != materiales.MaterialId)
            {
                return BadRequest();
            }

            if (string.IsNullOrWhiteSpace(materiales.Descripcion))
            {
                return BadRequest("La descripción del material es obligatoria.");
            }

            if (materiales.RubroId <= 0)
            {
                return BadRequest("Debe seleccionar un rubro válido.");
            }

            if (materiales.PrecioCosto <= 0)
            {
                return BadRequest("El precio costo debe ser mayor a cero.");
            }

            materiales.Descripcion = materiales.Descripcion.Trim().ToUpperInvariant();

            _context.Entry(materiales).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MaterialesExists(id))
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

        // POST: api/Materiales
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Materiales>> PostMateriales(Materiales materiales)
        {
            if (string.IsNullOrWhiteSpace(materiales.Descripcion))
            {
                return BadRequest("La descripción del material es obligatoria.");
            }

            if (materiales.RubroId <= 0)
            {
                return BadRequest("Debe seleccionar un rubro válido.");
            }

            if (materiales.PrecioCosto <= 0)
            {
                return BadRequest("El precio costo debe ser mayor a cero.");
            }

            materiales.Descripcion = materiales.Descripcion.Trim().ToUpperInvariant();

            _context.Materiales.Add(materiales);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMateriales", new { id = materiales.MaterialId }, materiales);
        }

        // DELETE: api/Materiales/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMateriales(int id)
        {
            var materiales = await _context.Materiales.FindAsync(id);
            if (materiales == null)
            {
                return NotFound();
            }

            _context.Materiales.Remove(materiales);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MaterialesExists(int id)
        {
            return _context.Materiales.Any(e => e.MaterialId == id);
        }
    }
}
