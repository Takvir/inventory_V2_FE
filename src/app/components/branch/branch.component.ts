import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { BranchService } from 'src/app/services/branch/branch.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css']
})
export class BranchComponent implements OnInit {
  branches: any[] = [];
  branchForm!: FormGroup;
  totalBranches: number = 0;
  branchId: string | null = null;
  editingBranchId: number | null = null;
  userType: string | null = null;

  @ViewChild('addBranchDialog')
  addBranchDialog!: TemplateRef<any>;

  constructor(
    private branchService: BranchService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private UserService: UserService,
    private route: ActivatedRoute
  ) {
    this.branchForm = this.fb.group({
      branch_name: ['', Validators.required],
      branch_id: [0, Validators.required],
      employee_number: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loaduser();
    this.branchId = this.route.snapshot.paramMap.get('branchID');
    this.userType = localStorage.getItem('user_type');
   
    
  }

  loadBranches(): void {
    this.branchService.getBranches().subscribe(data => {
      this.branches = data.filter(branch => !(branch.branch_name === 'Stock House' && branch.branch_id === 2000));
      this.totalBranches = this.branches.length;
      console.log(this.branches); // You can check the filtered data here
    });
  }

  loaduser() {
    this.UserService.getAllUsers().subscribe(data => {
      console.log(data);
    });
  }

  openAddBranchDialog(): void {
    this.branchForm.reset();
    this.editingBranchId = null;
    this.dialog.open(this.addBranchDialog);
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  submitBranchForm(): void {
    if (this.branchForm.valid) {
      if (this.editingBranchId) {
        // Update existing branch
        this.branchService.updateBranch(this.editingBranchId, this.branchForm.value).subscribe(() => {
          this.loadBranches();
          this.closeDialog();
        });
      } else {
        // Create new branch
        this.branchService.createBranch(this.branchForm.value).subscribe(() => {
          this.loadBranches();
          this.closeDialog();
        });
      }
    }
  }

  openEditBranchDialog(branch: any): void {
    this.branchForm.setValue({
      branch_name: branch.branch_name,
      branch_id: branch.branch_id,
      employee_number: branch.employee_number
    });
    this.editingBranchId = branch.branch_id;
    this.dialog.open(this.addBranchDialog);
  }
}
