import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from 'src/app/auth/user.service';

@Injectable({ providedIn: 'root' })
export class productService {
  productIds = [];
  vendor_id: string;
  productDetails: any[];
  constructor(private http: HttpClient, private userSF: UserService) {}

  addProduct(
    productName: string,
    categoryId: string,
    subCategoryId: string,
    vendor_id: string,
    store_id: string,
    image: string,
    price: string,
    discount: string
  ) {
    if (this.userSF.getAuthenticated) {
      const token = this.userSF.getToken();
      console.log('tokken...', token);
      const headers = new HttpHeaders({
        authorization: token,
      });
      console.log('add product triggered');
      const formData = new FormData();
      formData.append('vendor_id', vendor_id),
        formData.append('store_id', store_id),
        formData.append('name', productName),
        formData.append('price', price),
        formData.append('discount', discount),
        formData.append('category_id', categoryId),
        formData.append('subCategory_id', subCategoryId);
      formData.append('images', image);
      this.http
        .post('http://localhost:3000/api/add-product', formData, { headers })
        .subscribe((data) => console.log(data));
    }
  }

  getVendorID() {
    return this.vendor_id;
  }
  clearVendorID() {
    this.vendor_id = '';
  }

  getProducts(vendor_id: string): any {
    this.vendor_id = vendor_id;
    console.log('get product triggered...', vendor_id);
    if (this.userSF.getAuthenticated) {
      var token = this.userSF.getToken();
      console.log('fetch prooduct triggered......', token);
      const headers = new HttpHeaders({
        authorization: token,
      });
      const params = new HttpParams().set('vendor_id', vendor_id);

      const options = {
        headers: headers,
        params: params,
      };
      return this.http.get('http://localhost:3000/api/get-productNew', options);
    }
  }

  getOneProduct(product_id: string): any {
    if (this.userSF.getAuthenticated) {
      var token = this.userSF.getToken();
      console.log('fetch prooduct triggered......', token);
      const headers = new HttpHeaders({
        authorization: token,
      });
      const options = {
        headers: headers,
      };
      return this.http.get(
        `http://localhost:3000/api/get-one-product?product_id=${product_id}`,
        options
      );
    }
    return null;
  }

  addCartDetails(product_Id: string) {
    this.productIds.push(product_Id);
    console.log('product added..', this.productIds);

    this.userSF.addToCart();
    this.userSF.setCookie('test', 'data1', 1);
    console.log("cookie cvlaue",this.userSF.getCookie('test'));
  }

  removeFromCart(product_id: string) {
    const indexToRemove = this.productIds.indexOf(product_id);

    if (indexToRemove !== -1) {
      this.productIds.splice(indexToRemove, 1);
    }
  }

  getCartDetails() {
    return this.productIds;
  }

  addproductDetails(productDetails: any[]): any {
    if (this.userSF.getAuthenticated) {
      var token = this.userSF.getToken();
      console.log('fetch prooduct triggered......', token);
      const headers = new HttpHeaders({
        authorization: token,
      });
      // const params = new HttpParams().set('vendor_id', vendor_id);

      const options = {
        headers: headers,
      };
      return this.http.post(
        'http://localhost:3000/api/add-to-cart',
        productDetails,
        options
      );
    }
    return null;
  }
  temporaryDataStore(productDetails: any[]) {
    this.productDetails = productDetails;
    console.log(this.productDetails, 'product Details');
  }
  getTempData() {
    return this.productDetails;
  }
}
