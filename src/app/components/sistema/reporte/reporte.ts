import { Component, OnInit, inject } from '@angular/core';
import { SharedImports } from '@app/shared/shared.imports';
import { MarcacionReporteItem, MarcacionService } from '@app/services/marcacion.service';
import { UsuarioService } from '@app/services/usuario.service';
import { PersonaAsignacionDTO } from '@app/models/usuario.model';
import { Usuario } from '@app/models/auth.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [SharedImports, NgSelectModule],
  templateUrl: './reporte.html',
  styleUrls: ['./reporte.scss'],
})
export class ReporteComponent implements OnInit {
  private readonly marcacionService = inject(MarcacionService);
  private readonly usuarioService = inject(UsuarioService);

  protected tab: 'personal' | 'general' = 'personal';
  protected cargando = false;
  protected esAdmin = false;

  protected filtrosPersonal = {
    desde: '',
    hasta: '',
    tardanza: '',
  };

  protected filtrosGeneral = {
    id_persona: null as number | null,
    desde: '',
    hasta: '',
    tardanza: '',
  };

  protected personas: PersonaAsignacionDTO[] = [];
  protected resultadosPersonal: MarcacionReporteItem[] = [];
  protected resultadosGeneral: MarcacionReporteItem[] = [];

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarPersonas();
    this.buscarPersonal();
  }

  protected setTab(tab: 'personal' | 'general') {
    if (tab === 'general' && !this.esAdmin) {
      return;
    }
    this.tab = tab;
    if (tab === 'personal' && this.resultadosPersonal.length === 0) {
      this.buscarPersonal();
    }
    if (tab === 'general' && this.resultadosGeneral.length === 0) {
      this.buscarGeneral();
    }
  }

  protected buscarPersonal(): void {
    this.cargando = true;
    this.marcacionService
      .reporte({
        personal: true,
        desde: this.filtrosPersonal.desde || undefined,
        hasta: this.filtrosPersonal.hasta || undefined,
        tardanza: this.parseTardanza(this.filtrosPersonal.tardanza),
      })
      .subscribe({
        next: (res) => {
          this.resultadosPersonal = res.data || [];
          this.cargando = false;
        },
        error: () => (this.cargando = false),
      });
  }

  protected limpiarPersonal(): void {
    this.filtrosPersonal = { desde: '', hasta: '', tardanza: '' };
    this.buscarPersonal();
  }

  protected buscarGeneral(): void {
    this.cargando = true;
    this.marcacionService
      .reporte({
        id_persona: this.filtrosGeneral.id_persona || undefined,
        desde: this.filtrosGeneral.desde || undefined,
        hasta: this.filtrosGeneral.hasta || undefined,
        tardanza: this.parseTardanza(this.filtrosGeneral.tardanza),
      })
      .subscribe({
        next: (res) => {
          this.resultadosGeneral = res.data || [];
          this.cargando = false;
        },
        error: () => (this.cargando = false),
      });
  }

  protected limpiarGeneral(): void {
    this.filtrosGeneral = { id_persona: null, desde: '', hasta: '', tardanza: '' };
    this.buscarGeneral();
  }

  protected estadoTexto(item: MarcacionReporteItem): string {
    if (!item.entrada) return 'Pendiente';
    if (item.tardanza) return `Tardanza (+${item.minutos_tarde} min)`;
    return 'A tiempo';
  }

  protected exportarExcel(): void {
    const data = this.tab === 'personal' ? this.resultadosPersonal : this.resultadosGeneral;
    if (!data.length) return;
    const rows = [
      ['Fecha', 'Persona', 'Horario', 'Entrada', 'Inicio refri', 'Fin refri', 'Salida', 'Estado'],
      ...data.map((i) => [
        i.fecha,
        this.tab === 'general' ? `${i.nombres || ''} ${i.apellidos || ''}`.trim() : 'Yo',
        i.horario_nombre || 'Sin horario',
        i.entrada || 'Pendiente',
        i.inicio_refri || 'Pendiente',
        i.fin_refri || 'Pendiente',
        i.salida || 'Pendiente',
        this.estadoTexto(i),
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // estilos simples: ancho de columnas
    ws['!cols'] = [{ wch: 12 }, { wch: 28 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `reporte_${this.tab}.xlsx`);
  }

  protected exportarPDF(): void {
    const data = this.tab === 'personal' ? this.resultadosPersonal : this.resultadosGeneral;
    if (!data.length) return;
    const win = window.open('', '_blank', 'width=1024,height=768');
    if (!win) return;
    const rows = data
      .map(
        (i) => `
        <tr>
          <td>${i.fecha}</td>
          <td>${this.tab === 'general' ? `${i.nombres || ''} ${i.apellidos || ''}`.trim() : 'Yo'}</td>
          <td>${i.horario_nombre || 'Sin horario'}</td>
          <td>${i.entrada || 'Pendiente'}</td>
          <td>${i.inicio_refri || 'Pendiente'}</td>
          <td>${i.fin_refri || 'Pendiente'}</td>
          <td>${i.salida || 'Pendiente'}</td>
          <td>${this.estadoTexto(i)}</td>
        </tr>`
      )
      .join('');
    const fecha = new Date().toLocaleString();
    win.document.write(`
      <html><head><title>Reporte</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #233; }
        .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
        .title { font-size: 20px; font-weight: 700; color: #0a8; }
        .meta { font-size: 12px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #00a5a5; color: #fff; font-weight: 700; font-size: 12px; padding: 8px; }
        td { border: 1px solid #e2e8f0; padding: 7px; font-size: 12px; }
        tr:nth-child(even) { background: #f7fbfb; }
        .estado { font-weight: 700; }
      </style>
      </head><body>
      <div class="header">
        <div>
          <div class="title">Reporte ${this.tab === 'general' ? 'general' : 'personal'}</div>
          <div class="meta">Generado: ${fecha}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th><th>Persona</th><th>Horario</th><th>Entrada</th><th>Inicio refri</th><th>Fin refri</th><th>Salida</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.print();</script>
      </body></html>
    `);
    win.document.close();
  }

  private parseTardanza(valor: string): boolean | undefined {
    if (valor === '1') return true;
    if (valor === '0') return false;
    return undefined;
  }

  protected searchPersona = (term: string, item: PersonaAsignacionDTO) => {
    const normalized = term.toLowerCase();
    return (
      item.nombres.toLowerCase().includes(normalized) ||
      item.apellidos.toLowerCase().includes(normalized) ||
      (item.dni || '').toLowerCase().includes(normalized)
    );
  };

  private cargarPersonas(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (res) => (this.personas = res.data || []),
      error: () => (this.personas = []),
    });
  }

  private cargarPerfil(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (res) => {
        const usuario: Usuario | undefined = res.data;
        const roles = usuario?.roles?.map((r) => r.nombre?.toUpperCase()) || [];
        this.esAdmin = roles.includes('ADMINISTRADOR');
      },
      error: () => {
        this.esAdmin = false;
      },
    });
  }
}
