using System.ComponentModel.DataAnnotations;
namespace APIMateriales2026MartinoBautista.models
{
        public class Productos
    {
        [Key]
         public int ProductoId { get; set; } 

        public string? Descripcion { get; set; } = null!;
        public bool Eliminado { get; set; }
    }
}