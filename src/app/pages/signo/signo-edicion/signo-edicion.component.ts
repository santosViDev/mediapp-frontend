import { Signo } from './../../../_model/signo';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { SignoService } from './../../../_service/signo.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signo-edicion',
  templateUrl: './signo-edicion.component.html',
  styleUrls: ['./signo-edicion.component.css']
})
export class SignoEdicionComponent implements OnInit {

  form: FormGroup;
  id: number;
  edicion: boolean;

  constructor(    
    private route: ActivatedRoute,
    private router: Router,
    private signoService: SignoService
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'id': new FormControl(0),
      'idPaciente': new FormControl(''),
      'fecha': new FormControl(''),
      'pulso': new FormControl('', Validators.required),
      'temperatura': new FormControl('', Validators.required),
      'ritmoResp': new FormControl('')
    });

    this.route.params.subscribe((data: Params) => {
      this.id = data['id'];
      this.edicion = data['id'] != null;
      this.initForm();
    })
  }

  
  get f() { return this.form.controls; }

  initForm() {
    //Carga la data a editar
    if (this.edicion) {  
      this.signoService.listarPorId(this.id).subscribe(data => {
        this.form = new FormGroup({
          'id': new FormControl(data.idSigno),
          'idPaciente': new FormControl(data.idPaciente),
          'fecha': new FormControl(data.fecha),
          'pulso': new FormControl('', Validators.required),
          'temperatura': new FormControl('', Validators.required),
          'ritmoResp': new FormControl('')
        });      
      });
    }
  }

  operar(){

    if(this.form.invalid) {return;}

    let signo = new Signo();
    signo.idSigno = this.form.value['id'];
    signo.idPaciente = this.form.value['idPaciente'];
    signo.fecha = this.form.value['fecha'];
    signo.pulso = this.form.value['pulso'];
    signo.temperatura = this.form.value['temperatura'];
    signo.ritmoResp = this.form.value['ritmoResp'];

    if(this.edicion) {
      //Modificar
      this.signoService.modificar(signo).subscribe(() => {
        this.signoService.listar().subscribe(data => {
          this.signoService.signoCambio.next(data);
          this.signoService.mensajeCambio.next('SE MODIFICÓ');
        });
      });    
    } else {
      // Insertar
      this.signoService.registrar(signo).subscribe(() => {
        this.signoService.listar().subscribe(data => {
          this.signoService.signoCambio.next(data);
          this.signoService.mensajeCambio.next('SE REGISTRÓ');
        });
      });
    }
    this.router.navigate(['signo']);
  }
}