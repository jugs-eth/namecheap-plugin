"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const axios_1 = __importDefault(require("axios"));
const fast_xml_parser_1 = require("fast-xml-parser");
const dotenv = __importStar(require("dotenv"));
// Load .env from openclaw root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
const API_URL = 'https://api.namecheap.com/xml.response';
const API_KEY = process.env.NAMECHEAP_API_KEY || '';
const API_USER = process.env.NAMECHEAP_USER || '';
const CLIENT_IP = process.env.NAMECHEAP_CLIENT_IP || '95.216.209.150';
const DEFAULT_TLDS = ['.com', '.io', '.co', '.ai', '.xyz'];
const SEARCH_TLDS = ['.com', '.io', '.co', '.ai', '.xyz', '.dev', '.app', '.net', '.org'];
const parser = new fast_xml_parser_1.XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
function err(msg) {
    process.stderr.write(JSON.stringify({ error: msg }) + '\n');
    process.exit(1);
}
function out(data) {
    console.log(JSON.stringify(data, null, 2));
}
if (!API_KEY || !API_USER)
    err('Missing NAMECHEAP_API_KEY or NAMECHEAP_USER in .env');
async function api(command, params = {}) {
    const allParams = {
        ApiUser: API_USER,
        ApiKey: API_KEY,
        UserName: API_USER,
        ClientIp: CLIENT_IP,
        Command: command,
        ...params,
    };
    const resp = await axios_1.default.get(API_URL, { params: allParams });
    const parsed = parser.parse(resp.data);
    const root = parsed.ApiResponse;
    if (root?.['@_Status'] === 'ERROR') {
        const errors = root?.Errors?.Error;
        const msg = Array.isArray(errors)
            ? errors.map((e) => e['#text'] || e).join('; ')
            : errors?.['#text'] || errors || 'Unknown API error';
        err(String(msg));
    }
    return root?.CommandResponse;
}
function getRegistrantInfo(prefix = '') {
    const p = prefix;
    return {
        [`${p}FirstName`]: process.env.NAMECHEAP_FIRST_NAME || 'Josh',
        [`${p}LastName`]: process.env.NAMECHEAP_LAST_NAME || 'Lloyd',
        [`${p}Address1`]: process.env.NAMECHEAP_ADDRESS || '252 Swan Lane',
        [`${p}City`]: process.env.NAMECHEAP_CITY || 'Manchester',
        [`${p}StateProvince`]: process.env.NAMECHEAP_STATE || 'Greater Manchester',
        [`${p}PostalCode`]: process.env.NAMECHEAP_POSTAL || 'WN2 4EY',
        [`${p}Country`]: process.env.NAMECHEAP_COUNTRY || 'GB',
        [`${p}Phone`]: process.env.NAMECHEAP_PHONE || '+47.91365265',
        [`${p}EmailAddress`]: process.env.NAMECHEAP_EMAIL || 'joshlloyd4031@gmail.com',
    };
}
function splitDomain(domain) {
    const i = domain.indexOf('.');
    if (i === -1)
        err(`Invalid domain: ${domain}`);
    return [domain.substring(0, i), domain.substring(i + 1)];
}
function expandDomains(input) {
    const parts = input.split(',').map(s => s.trim()).filter(Boolean);
    const domains = [];
    for (const p of parts) {
        if (p.includes('.')) {
            domains.push(p);
        }
        else {
            for (const tld of DEFAULT_TLDS)
                domains.push(p + tld);
        }
    }
    return domains;
}
function parseArg(args, flag, def) {
    const i = args.indexOf(flag);
    if (i === -1)
        return def;
    return args[i + 1] || def;
}
function toArray(val) {
    if (!val)
        return [];
    return Array.isArray(val) ? val : [val];
}
async function main() {
    const args = process.argv.slice(2);
    const cmd = args[0];
    if (!cmd)
        err('Usage: namecheap <command> [args]');
    switch (cmd) {
        case 'check': {
            if (!args[1])
                err('Usage: check <domain1,domain2,...>');
            const domains = expandDomains(args[1]);
            const resp = await api('namecheap.domains.check', { DomainList: domains.join(',') });
            const results = toArray(resp?.DomainCheckResult).map((d) => ({
                domain: d['@_Domain'],
                available: d['@_Available'] === 'true',
                premium: d['@_IsPremiumName'] === 'true',
                price: d['@_PremiumRegistrationPrice'] || undefined,
            }));
            out(results);
            break;
        }
        case 'search': {
            if (!args[1])
                err('Usage: search <keyword>');
            const keyword = args[1];
            const domains = SEARCH_TLDS.map(t => keyword + t);
            const resp = await api('namecheap.domains.check', { DomainList: domains.join(',') });
            const results = toArray(resp?.DomainCheckResult)
                .map((d) => ({
                domain: d['@_Domain'],
                available: d['@_Available'] === 'true',
                premium: d['@_IsPremiumName'] === 'true',
                price: d['@_PremiumRegistrationPrice'] || undefined,
            }));
            out(results);
            break;
        }
        case 'register': {
            if (!args[1])
                err('Usage: register <domain> [--years N]');
            const domain = args[1];
            const years = parseArg(args, '--years', '1');
            const [sld, tld] = splitDomain(domain);
            const reg = {
                ...getRegistrantInfo('Registrant'),
                ...getRegistrantInfo('Tech'),
                ...getRegistrantInfo('Admin'),
                ...getRegistrantInfo('AuxBilling'),
                DomainName: domain,
                Years: years,
            };
            const resp = await api('namecheap.domains.create', reg);
            out(resp?.DomainCreateResult || resp);
            break;
        }
        case 'list': {
            const page = parseArg(args, '--page', '1');
            const pageSize = parseArg(args, '--pageSize', '20');
            const resp = await api('namecheap.domains.getList', { Page: page, PageSize: pageSize });
            const domains = toArray(resp?.DomainGetListResult?.Domain).map((d) => ({
                name: d['@_Name'],
                expires: d['@_Expires'],
                isExpired: d['@_IsExpired'] === 'true',
                autoRenew: d['@_AutoRenew'] === 'true',
                whoisGuard: d['@_WhoisGuard'],
            }));
            out({ domains, paging: resp?.Paging });
            break;
        }
        case 'info': {
            if (!args[1])
                err('Usage: info <domain>');
            const resp = await api('namecheap.domains.getInfo', { DomainName: args[1] });
            out(resp?.DomainGetInfoResult || resp);
            break;
        }
        case 'dns-get': {
            if (!args[1])
                err('Usage: dns-get <domain>');
            const [sld, tld] = splitDomain(args[1]);
            const resp = await api('namecheap.domains.dns.getHosts', { SLD: sld, TLD: tld });
            const hosts = toArray(resp?.DomainDNSGetHostsResult?.host).map((h) => ({
                type: h['@_Type'],
                name: h['@_Name'],
                value: h['@_Address'],
                ttl: h['@_TTL'],
                mxPref: h['@_MXPref'] || undefined,
            }));
            out(hosts);
            break;
        }
        case 'dns-set': {
            if (!args[1])
                err('Usage: dns-set <domain> --records <json>');
            const domain = args[1];
            const recordsJson = parseArg(args, '--records');
            if (!recordsJson)
                err('--records is required');
            let records;
            try {
                records = JSON.parse(recordsJson);
            }
            catch {
                err('Invalid JSON for --records');
            }
            const [sld, tld] = splitDomain(domain);
            const params = { SLD: sld, TLD: tld };
            records.forEach((r, i) => {
                const n = i + 1;
                params[`HostName${n}`] = r.name || '@';
                params[`RecordType${n}`] = r.type || 'A';
                params[`Address${n}`] = r.value;
                params[`TTL${n}`] = String(r.ttl || 1800);
                if (r.mxPref)
                    params[`MXPref${n}`] = String(r.mxPref);
            });
            const resp = await api('namecheap.domains.dns.setHosts', params);
            out(resp?.DomainDNSSetHostsResult || resp);
            break;
        }
        case 'nameservers-get': {
            if (!args[1])
                err('Usage: nameservers-get <domain>');
            const [sld, tld] = splitDomain(args[1]);
            const resp = await api('namecheap.domains.dns.getList', { SLD: sld, TLD: tld });
            out(resp?.DomainDNSGetListResult || resp);
            break;
        }
        case 'nameservers-set': {
            if (!args[1])
                err('Usage: nameservers-set <domain> --ns <ns1,ns2,...>');
            const [sld, tld] = splitDomain(args[1]);
            const ns = parseArg(args, '--ns');
            if (!ns)
                err('--ns is required');
            const resp = await api('namecheap.domains.dns.setCustom', { SLD: sld, TLD: tld, Nameservers: ns });
            out(resp?.DomainDNSSetCustomResult || resp);
            break;
        }
        case 'ssl-list': {
            const resp = await api('namecheap.ssl.getList');
            out(toArray(resp?.SSLListResult?.SSL));
            break;
        }
        case 'ssl-create': {
            if (!args[1])
                err('Usage: ssl-create <domain> [--type PositiveSSL] [--years 1]');
            const type = parseArg(args, '--type', 'PositiveSSL');
            const years = parseArg(args, '--years', '1');
            const resp = await api('namecheap.ssl.create', { Type: type, Years: years });
            out(resp?.SSLCreateResult || resp);
            break;
        }
        case 'ssl-activate': {
            if (!args[1] || !args[2])
                err('Usage: ssl-activate <certId> <domain> --csr <file_or_string>');
            const certId = args[1];
            const domain = args[2];
            let csr = parseArg(args, '--csr');
            if (!csr)
                err('--csr is required');
            // If it's a file path, read it
            if (fs.existsSync(csr))
                csr = fs.readFileSync(csr, 'utf-8');
            const resp = await api('namecheap.ssl.activate', {
                CertificateID: certId,
                CSR: csr,
                AdminEmailAddress: process.env.NAMECHEAP_EMAIL || 'joshlloyd4031@gmail.com',
                WebServerType: 'nginx',
            });
            out(resp?.SSLActivateResult || resp);
            break;
        }
        case 'whoisguard-enable': {
            if (!args[1])
                err('Usage: whoisguard-enable <domain>');
            // Use setRegistrarLock as proxy; true WhoisGuard management requires separate API
            const resp = await api('namecheap.domains.setRegistrarLock', {
                DomainName: args[1],
                LockAction: 'LOCK',
            });
            out(resp?.DomainSetRegistrarLockResult || resp);
            break;
        }
        case 'renew': {
            if (!args[1])
                err('Usage: renew <domain> [--years 1]');
            const years = parseArg(args, '--years', '1');
            const resp = await api('namecheap.domains.renew', { DomainName: args[1], Years: years });
            out(resp?.DomainRenewResult || resp);
            break;
        }
        case 'transfer-status': {
            if (!args[1])
                err('Usage: transfer-status <domain>');
            const resp = await api('namecheap.domains.transfer.getStatus', { TransferID: args[1] });
            out(resp?.TransferGetStatusResult || resp);
            break;
        }
        default:
            err(`Unknown command: ${cmd}. Available: check, search, register, list, info, dns-get, dns-set, nameservers-get, nameservers-set, ssl-list, ssl-create, ssl-activate, whoisguard-enable, renew, transfer-status`);
    }
}
main().catch(e => {
    process.stderr.write(JSON.stringify({ error: e.message || String(e) }) + '\n');
    process.exit(1);
});
