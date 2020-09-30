import { BuscarDialogoComponent } from './buscar-dialogo/buscar-dialogo.component';
import { MatSort } from '@angular/material/sort';
import { Consulta } from './../../_model/consulta';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FiltroConsultaDTO } from './../../_dto/filtroConsultaDTO';
import { ConsultaService } from './../../_service/consulta.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.component.html',
  styleUrls: ['./buscar.component.css']
})
export class BuscarComponent implements OnInit {

  form: FormGroup;
  maxFecha: Date = new Date();
  displayedColumns = ['paciente', 'medico', 'especialidad', 'fecha', 'acciones'];
  dataSource: MatTableDataSource<Consulta>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private consultaService: ConsultaService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'dni': new FormControl(''),
      'nombreCompleto': new FormControl(''),
      'fechaConsulta': new FormControl()
    });
  }

  buscar() {
    let filtro = new FiltroConsultaDTO(this.form.value['dni'], this.form.value['nombreCompleto'], moment(this.form.value['fechaConsulta']).format('YYYY-MM-DDTHH:mm:ss'));

    /*
      {
        dni : ''
        nombreCompleto: xxxxx
        fecha: ''
      }

      {       
        nombreCompleto: xxxxx        
      }
    */

    if (filtro.fechaConsulta) {
      delete filtro.dni;
      delete filtro.nombreCompleto;
    } else {
      delete filtro.fechaConsulta;

      if (filtro.dni.length === 0) {
        delete filtro.dni;
      }

      if (filtro.nombreCompleto.length === 0) {
        delete filtro.nombreCompleto
      }
    }

    this.consultaService.buscar(filtro).subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  verDetalle(consulta: Consulta) {
    this.dialog.open(BuscarDialogoComponent, {
      data: consulta
    });
  }

}
