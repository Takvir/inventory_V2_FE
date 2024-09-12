import { Component, OnInit } from '@angular/core';
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

export interface Group2 {
  group_id: number;
  group_name: string;
  stock_in_hand: number;
  user_group: string;
}

@Component({
  selector: 'app-branch-repor',
  templateUrl: './branch-repor.component.html',
  styleUrls: ['./branch-repor.component.css']
})
export class BranchReporComponent implements OnInit {

  assets: Asset[] = [];
  groups: Group2[] = [];
  reportData: { [key: string]: number } = {}; // To store the count of each group_name
  tableHeaders: string[] = []; // To store the group names as table headers

  isEdit: boolean = false;
  editAssetId: number | null = null;
  noDataFound: boolean = false;
  loading: boolean = false;

  isBranchUser: boolean = false;
  userType: string | null = null;
  userID: string | null = null;
  userIdNum: number | null = null;
  branchName : string | null = null;

  constructor(
    private tagService: TagAssetService,
    private branchService: BranchService,
    private groupService: GroupService
  ) { }

  ngOnInit(): void {
    this.userType = localStorage.getItem('user_type');
    this.userID = localStorage.getItem('branch_id');
    this.userIdNum = parseInt(localStorage.getItem('branch_id') || '0', 10);

    console.log(typeof (this.userIdNum));

    this.loadAssets();
    this.loadGroups();
  }

  loadAssets(): void {
    if (this.userIdNum) {
      this.tagService.getAssetsByBranch(this.userIdNum).subscribe({
        next: (data: Asset[]) => {
          this.assets = data;
          this.noDataFound = data.length === 0;
          
          this.generateReport();
        },
        error: (error) => {
          console.error('Error loading assets:', error);
          this.noDataFound = true;
        }
      });
    }
    
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

      this.tableHeaders = this.groups.map(group => group.group_name);
      console.log('Filtered Groups:', this.groups);
    });
  }

  generateReport(): void {
    // Initialize the report data with group names from the assets
    this.reportData = {};

    // Count occurrences of each group_name from the assets
    this.assets.forEach(asset => {
      if (this.reportData[asset.group_name]) {
        this.reportData[asset.group_name]++;
      } else {
        this.reportData[asset.group_name] = 1;
      }
    });

    console.log('Report Data:', this.reportData);
  }
}
