using System.ComponentModel.DataAnnotations;
namespace APIMateriales2026MartinoBautista.models

{
        public class Materiales
    {   
        [Key]
        public int MaterialId { get; set; } 

        public string? Descripcion { get; set; } = null!;
        public int RubroId { get; set; }
        public decimal PrecioCosto { get; set; }
        public bool Eliminado { get; set; }
    }
}