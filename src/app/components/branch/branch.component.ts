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
  editingBranchId: number | null = null; // Store the ID of the branch being edited

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
  }

  loadBranches(): void {
    this.branchService.getBranches().subscribe(data => {
      this.branches = data;
      this.totalBranches = this.branches.length;
      console.log(data);
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
