import { Component, OnInit, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface IFoodDoc {
  id: number,
  name: string,
  age?: number,
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Food Doc';

  docs: IFoodDoc[] = [];
  loading: boolean = true;

  headers: object[] = [
    {
      label: 'No',
      key: 'id',
      output: (id: number): string => (id + 1).toString()
    }, {
      label: 'Name',
      key: 'name',
    }, {
      label: 'Age',
      key: 'age',
      class: (age: number = 0): string => {
        if (age > 18) return 'green';
        return 'red';
      },
      output: (age: any): string => {
        if (age == null) {
          return 'undefined';
        }
        return age.toString();
      }
    }
  ]

  constructor(
    private http: HttpClient
  ) {
    //
  }

  ngOnInit() {
    this.getDocs();
  }

  private getDocs() {
    this.fetchDocs()
      .subscribe((resp: IFoodDoc[]) => {
        const removed = JSON.parse(window.localStorage.getItem('removed')) || {};
        this.docs = resp.filter(doc => !removed[doc.id]);
        this.loading = false;
      });
  }

  private fetchDocs(): Observable<IFoodDoc[]> {
    return this.http.get<IFoodDoc[]>('http://dev.api.fooddocs.ee/testtask').pipe(
      tap((list: any[]) => console.log(`Fetched ${list.length} Docs`)),
      catchError(this.handleError(`Fetch Docs`, []))
    )
  }

  private removeDoc(id): void {
    const removed = JSON.parse(window.localStorage.getItem('removed')) || {};
    removed[id] = true;
    window.localStorage.setItem('removed', JSON.stringify(removed));
    this.docs = this.docs.filter(doc => doc.id !== id);
  }

  private restoreDocs(): void {
    window.localStorage.setItem('removed', JSON.stringify({}));
    this.getDocs();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return Observable.apply(result as T);
    }
  }
}
