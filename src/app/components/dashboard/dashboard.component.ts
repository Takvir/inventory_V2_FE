import { Component, OnInit } from '@angular/core';
import { SectionService } from 'src/app/services/section/section.service';
import { BranchService } from 'src/app/services/branch/branch.service';
import { GroupService } from 'src/app/services/group/group.service';


interface Asset {
  id: number;
  branch_id: number;
  branch_name: string;
  group_id: number;
  desktop_name: string;
  configuration: string;
  tag_name: string;
  warranty: string;
  price: number;
  purchase_date: string;
  status: string;
  asset_get_by: string;
  serial_number: string;
  group_name: string;
  sub_branch: string;
  OS?: string;
  RAM?: string;
  Storage?: string;
  work_order?: string;
  challan_no?: string;
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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  assets: Asset[] = [];
  branches: Branch[] = [];
  groups: Group2[] = [];
  totalPrice: number = 0;



  constructor(
    private assetService: SectionService,
    private branchService: BranchService,
    private groupService: GroupService,
  ) { }

  ngOnInit(): void {
    this.loadBranches();
    this.loadGroups();
    this.loadAssets();
  }

  loadGroups(): void {
    this.groupService.getGroups2().subscribe(data => {
      const userType = localStorage.getItem('user_type');
  
      if (userType === 'branch') {
       this.groups = data.filter(group => group.user_group === 'branch');
      } else {
        this.groups = data;
      }
  
    });
  }
  
  loadAssets(): void {
    this.assetService.getAssets().subscribe(assets => {
      this.assets = assets;
  
      // Calculate the total price of all assets
      this.totalPrice = this.assets.reduce((sum, asset) => {
        // Cast price to string and then parse as a float
        const price = parseFloat(asset.price as unknown as string);
        return sum + (isNaN(price) ? 0 : price);
      }, 0);
  
      console.log(this.totalPrice);
    });
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
          this.branches = data.filter(branch => branch.branch_id === branchIdNum);
        } else {
          this.branches = [];
        }
      }
    });
  }




}

