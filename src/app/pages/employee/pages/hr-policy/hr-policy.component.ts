import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../core/services/shared.service';

@Component({
  selector: 'app-policy',
  templateUrl: './hr-policy.component.html',
  styleUrls: ['./hr-policy.component.scss'],
  standalone: false
})
export class HrPolicyComponent implements OnInit {
  policies: any[] = [];

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    this.sharedService.getHrPolicies().subscribe((data: any) => {
      this.policies = data;
    });
  }
}
