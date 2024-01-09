import { Component, OnInit } from '@angular/core';
import { productService } from '../add-product/product.service';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-view-orders',
  templateUrl: './view-orders.component.html',
  styleUrls: ['./view-orders.component.css'],
})
export class ViewOrdersComponent implements OnInit {
  constructor(private productSF: productService, private route: Router) {}
  orderNumber: { [key: string]: string } = {};
  uniqueORder: any;
  productDetails: any[] = [];
  compProdDet: any[] = [];
  productPrice: number = 0;
  uniqueId: string;

  ngOnInit(): void {
    this.getOrders();
    // this.productSF.updateCartVendStatus().subscribe((res) => {
    //   console.log('inside productSF status', res);
    // });
  }

  private calcPP(price: number, discount: number, noOfProduct: number) {
    return (price - price * (discount / 100)) * noOfProduct;
  }
  getOrders() {
    this.productSF.getOderDetails().subscribe((res) => {
      this.orderNumber = res.data;
      console.log('vendor specific orders', res);
    });
  }
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  getOrderDet(uniqueID) {
    this.productDetails = [];
    console.log('unique Id', uniqueID);
    this.uniqueId = uniqueID;
    this.productPrice = 0;
    for (const key in this.orderNumber) {
      if (this.orderNumber.hasOwnProperty(key)) {
        if (key === uniqueID) {
          this.uniqueORder = this.orderNumber[key];
        }
      }
    }
    console.log('uniqueOrder', this.uniqueORder);
    this.productDetails = this.uniqueORder.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      address: item.address,
      status: item.status,
    }));
    console.log('productDetails', this.productDetails);
    console.log('orderNumber', this.orderNumber);

    for (let i = 0; i < this.productDetails.length; i++) {
      const element = this.productDetails[i].product_id;
      this.productSF.getOneProduct(element).subscribe((res) => {
        console.log('address>>>>>>>', this.productDetails[i].quantity);
        console.log('res of produc', res.data[0]);
        this.compProdDet[i] = res.data[0];

        const noOfProduct = this.productDetails[i].quantity;
        this.productPrice =
          this.productPrice +
          this.calcPP(+res.data[0].price, +res.data[0].discount, noOfProduct);
      });
      console.log('res of produc22222222', this.compProdDet);
    }
  }

  updateStatus$(): Observable<any> {
    return this.productSF
      .updateCartVendStatus('Order Packed', this.uniqueId)
      .pipe(
        switchMap((res) => {
          console.log('inside productSF status', res.success);
          if (res.success) {
            return of(true);
          }
          return of(false);
        })
      );
  }

  updateStatus() {
    this.updateStatus$().subscribe((res) => {
      if (res) {
        console.log('Inside obs logic', res);
        this.productDetails[0].status = 'Order Packed';
        this.getOrders();
        this.getOrderDet(this.uniqueId);
      }
    });
  }
}
