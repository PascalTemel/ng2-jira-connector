import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/toPromise';

export interface IProjectPartial {
	id?: string|number;
	key?: string;
	name?: string;
}
export interface IIssuePriority {
	id?: string|number;
	name?: string;
}
export interface IIssueType {
	description?: string;
	id?: string|number;
	name?: string;
	subtask?: boolean;
}
export interface IIssueFields {
	components?: any[];
	customfields?: Object;
	description?: string;
	duedate?: any;
	issuetype: IIssueType;
	labels?: any[];
	priority?: IIssuePriority;
	project: IProjectPartial,
	summary: string;
}

export const JIRA_URL = new InjectionToken<string>('JiraUrl');

@Injectable()
export class JiraconnectorService {
	public headers: Headers = new Headers({'Content-type': 'application/json'});

	constructor(
		private _http: Http,
		@Inject(JIRA_URL) public jiraUrl: string
	) { }

	public setBasicAuthorization(username: string, password: string): void {
		this.headers.append('Authorization', 'Basic ' + window.btoa(`${username}:${password}`));
	}

	public createComment(issueId: string, comment: string): Observable<any> {
		return this._http.post(`${this.jiraUrl}issue/${issueId}/comment`, JSON.stringify({ body: comment }), { headers: this.headers, withCredentials: true })
			.map((response) => response.json())
			.catch((error) => this.handleError(error));
	}

	public createIssue(fields: IIssueFields): Observable<any> {
		if (fields.customfields) {
			this.mapCustomfields(fields);
		}
		return this._http.post(`${this.jiraUrl}issue`, JSON.stringify({ fields: fields }), { headers: this.headers, withCredentials: true })
			.map((response) => response.json())
			.catch((error) => this.handleError(error));
	}

	public editIssue(issueId: string, fields: IIssueFields): Observable<any> {
		if (fields.customfields) {
			this.mapCustomfields(fields);
		}
		return this._http.put(`${this.jiraUrl}issue/${issueId}`, JSON.stringify({ fields: fields }), { headers: this.headers, withCredentials: true })
			.map((response) => response.json())
			.catch((error) => this.handleError(error));
	}

	public getIssue(issueId: string): Observable<any> {
		return this._http.get(`${this.jiraUrl}issue/${issueId}`, { withCredentials: true })
			.map((response) => response.json())
			.catch((error) => this.handleError(error));
	}

	public searchIssues(jqlString: string): Observable<any> {
		return this._http.post(`${this.jiraUrl}search`, { jql: jqlString }, { withCredentials: true })
			.map((response) => response.json())
			.catch((error) => this.handleError(error));
	}

	public mapCustomfields(fields: IIssueFields): void {
		for (let key in fields.customfields) {
			fields[key] = fields.customfields[key];
		}
		fields.customfields = null;
	}

	public handleError(error: any): Observable<string> {
		return Observable.throw(error.message || error);
	}
}
