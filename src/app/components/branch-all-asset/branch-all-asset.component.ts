import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BranchService } from 'src/app/services/branch/branch.service';
import { GroupService } from 'src/app/services/group/group.service';
import { SectionService } from 'src/app/services/section/section.service';
import { TagAssetService } from 'src/app/services/tag-asset/tag-asset.service';

export interface Asset {
  asset_id: number;
  branch_id: number;
  branch_name: string;
  group_id: number;
  group_name: string;
  desktop_name: string;
  configuration: string;
  tag_name: string;
  warranty: string;
  price: number;
  purchase_date: Date;
  status: string;
  asset_get_by: string;
  serial_number: string;
  sub_branch: string;
  OS: string;
  RAM: string;
  Storage: string;
  work_order: string;
  challan_no: string;
}

export interface Branch {
  branch_id: number;
  branch_name: string;
}

export interface Group {
  group_id: number;
  group_name: string;
  branch_id: number;
}

export interface Group2 {
  group_id: number;
  group_name: string;
  stock_in_hand: number;
  user_group: string;
}

@Component({
  selector: 'app-branch-all-asset',
  templateUrl: './branch-all-asset.component.html',
  styleUrls: ['./branch-all-asset.component.css']
})
export class BranchAllAssetComponent implements OnInit {

  assets: Asset[] = [];
  viewAssetsForm!: FormGroup;  // For viewing assets
  editAssetForm!: FormGroup;   // For editing asset
  isEdit: boolean = false;
  editAssetId: number | null = null;
  branches: Branch[] = [];
  groups: Group2[] = [];
  subBranchOptions: string[] = [];
  noDataFound: boolean = false;
  isBranchDisabled = true;
  isSubBranchDisabled = true;
  isGroupDisabled = true;
  isStatusDisabled = true;

  loading: boolean = false;


  isBranchUser: boolean = false;


  constructor( private tagService: TagAssetService,
    private branchService: BranchService,
    private groupService: GroupService,
    private fb: FormBuilder
  ) {
    this.viewAssetsForm = this.fb.group({
      branch_id: ['', Validators.required],
      group_id: ['', Validators.required],
      sub_branch: [{ value: '', disabled: this.isSubBranchDisabled }]

    });

    this.editAssetForm = this.fb.group({
      branch_id: ['', Validators.required],
      group_id: ['', Validators.required],
      desktop_name: ['', Validators.required],
      configuration: ['', Validators.required],
      tag_name: ['', Validators.required],
      warranty: ['', Validators.required],
      price: ['', Validators.required],
      purchase_date: ['', Validators.required],
      status: ['', Validators.required],
      asset_get_by: ['', Validators.required],
      serial_number: ['', Validators.required],
      sub_branch: ['', Validators.required],
      group_name: ['', Validators.required],
      branch_name: ['', Validators.required],
      OS: ['', Validators.required],
      RAM: ['', Validators.required],
      Storage: ['', Validators.required],
      work_order: ['', Validators.required],
      challan_no: ['', Validators.required],
    });
 }


 ngOnInit(): void {
  this.loadBranches();
  this.loadGroups();

  const userType = localStorage.getItem('user_type');
  if (userType === 'branch') {
    this.isBranchUser = true;
    this.viewAssetsForm.get('branch_id')?.setValidators(Validators.required);
    this.viewAssetsForm.get('branch_id')?.updateValueAndValidity();
  }

  // this.editAssetForm.get('branch_id')?.disable();
  // this.editAssetForm.get('group_id')?.disable();
  // this.editAssetForm.get('sub_branch')?.disable();

  this.isBranchDisabled = true;
}

loadBranches(): void {
  this.branchService.getBranches().subscribe((data: Branch[]) => {
    const userType = localStorage.getItem('user_type');

    if (userType === 'superadmin') {
      this.branches = data;
    }
    else if(userType === 'fad'){
      this.branches = data;
    } 
    else {
      const branchId = localStorage.getItem('branch_id');
      if (branchId) {
        const branchIdNum = parseInt(branchId, 10);
        this.branches = data.filter(branch => branch.branch_id === branchIdNum );
      } else {
        this.branches = []; // Or any default behavior if no branch ID is set
      }
    }
  });
}

loadGroups(): void {
  this.groupService.getGroups2().subscribe(data => {
    const userType = localStorage.getItem('user_type');

   
    console.log('User Type:', userType);

    if (userType === 'branch') {
     this.groups = data.filter(group => group.user_group === 'branch');
    } else {
      
      this.groups = data;
    }

    console.log('Filtered Groups:', this.groups);
  });
}

onBranchChange(event: Event): void {
  const selectElement = event.target as HTMLSelectElement;

  const selectedBranchId = parseInt(selectElement.value, 10);
  const selectedBranch = this.branches.find(branch => branch.branch_id === selectedBranchId);

  if (selectedBranch && selectedBranch.branch_name === 'Head Office') {
    this.subBranchOptions = [
      'Select Division',
      'Brand Communication & Public Relations Division',
      'Common Services Division',
      'Corporate & Investment Banking Division',
      'Credit Administration Division',
      'Chairman Sir & MD & CEO Office',
      'Credit Risk Management Division',
      'Agent Banking',
      'AML & CFT',
      'ICT',
      'ADC',
      'Card Division',
      'Human Resource',
      'FAD',
      'Bach',
      'Operation',
      'Internal Control & Compliance Division',
      'International Division',
      'Loan Recovery Division',
      'Mobile Financial Services Division',
      'Retail Banking Division',
      'Risk Management Division',
      'RPD & MIS Division',
      'SME Division',
      'Trade Services Division',
      'Treasury Back Office', 
      'Treasury Front Office', 
      'Treasury Mid Office',
    ];
    this.viewAssetsForm.get('sub_branch')?.enable();
  } else {
    this.subBranchOptions = ['Select Division'];
    this.viewAssetsForm.get('sub_branch')?.disable();
    this.viewAssetsForm.patchValue({ sub_branch: 'Select Division' });
  }
}

loadAssets(): void {
  const { branch_id, group_id, sub_branch } = this.viewAssetsForm.value;
  this.loading = true;
  this.noDataFound = false;

  if (branch_id && group_id && sub_branch && sub_branch !== 'Select Division') {
    this.tagService.getAssetsByBranchGroupAndSubBranch(branch_id, group_id, sub_branch).subscribe({
      next: (data: Asset[]) => {
        this.assets = data;
        this.noDataFound = data.length === 0;
      },
      error: (error) => {
        console.error('Error loading assets:', error);
        this.noDataFound = true;
      }
    });
  } else if (branch_id && sub_branch && sub_branch !== 'Select Division') {
    this.tagService.getAssetsByBranchAndSubBranch(branch_id, sub_branch).subscribe({
      next: (data: Asset[]) => {
        this.assets = data;
        this.noDataFound = data.length === 0;
      },
      error: (error) => {
        console.error('Error loading assets:', error);
        this.noDataFound = true;
      }
    });
  } else if (branch_id && group_id) {
    this.tagService.getAssetsByBranchAndGroup(branch_id, group_id).subscribe({
      next: (data: Asset[]) => {
        this.assets = data;
        this.noDataFound = data.length === 0;
      },
      error: (error) => {
        console.error('Error loading assets:', error);
        this.noDataFound = true;
      }
    });
  } else if (branch_id) {
    this.tagService.getAssetsByBranch(branch_id).subscribe({
      next: (data: Asset[]) => {
        this.assets = data;
        this.noDataFound = data.length === 0;
      },
      error: (error) => {
        console.error('Error loading assets:', error);
        this.noDataFound = true;
      }
    });
  } else if (group_id) {
    this.tagService.getAssetsByGroup(group_id).subscribe({
      next: (data: Asset[]) => {
        this.assets = data;
        this.noDataFound = data.length === 0;
      },
      error: (error) => {
        console.error('Error loading assets:', error);
        this.noDataFound = true;
      }
    });
  }
}

editAsset(assetId: number): void {
  this.isEdit = true;
  this.editAssetId = assetId;
  this.tagService.getAssetById(assetId).subscribe(asset => {
    this.editAssetForm.patchValue({
      ...asset,
      branch_id: asset.branch_id,
      group_id: asset.group_id
    });
  });



}

onSubmit(): void {
  if (this.editAssetForm.valid) {
    if (this.isEdit && this.editAssetId) {
      this.tagService.updateAsset(this.editAssetId, this.editAssetForm.value).subscribe(() => {
        this.loadAssets();
        this.resetForm();
        window.confirm('Asset Updated Successfully!');

      });
    }

  }
}

resetForm(): void {
  this.editAssetForm.reset();
  this.isEdit = false;
  this.editAssetId = null;
}

isFAD(tagName: string): boolean {
  return tagName === 'Routed To FAD';
}

isValueNaN(value: any): boolean {
  return isNaN(value);
}
isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
isRoutedToCSD(date: any): boolean {
  return typeof date === 'string' && date === 'Routed To CSD';
}


calculateAssetValue(purchaseDate: Date, price: number): number {
  const currentDate = new Date();
  const purchaseDateObj = new Date(purchaseDate);
  const daysSincePurchase = (currentDate.getTime() - purchaseDateObj.getTime()) / (1000 * 3600 * 24);
  const totalDays = 5 * 365; // Total days for 5 years

  if (daysSincePurchase >= totalDays) {
    return 0;
  } else {
    const depreciationRate = daysSincePurchase / totalDays;
    return Math.ceil(price * (1 - depreciationRate));
  }
}


}
