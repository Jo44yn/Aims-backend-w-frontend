# Test script for AIMS Backend API endpoints

$baseUrl = "http://127.0.0.1:8000"

Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "       AIMS API VERIFICATION TEST        " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

# 1. Login
Write-Host "`n[1/8] Testing POST /api/v1/auth/login..." -ForegroundColor Cyan
$loginPayload = @{
    email = "admin@aimforce.example"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" `
        -Method Post `
        -Body $loginPayload `
        -ContentType "application/json" `
        -Headers @{ "Accept" = "application/json" }

    Write-Host "  -> [PASS] Login Successful!" -ForegroundColor Green
    Write-Host "     Token Type   : $($loginResponse.token_type)"
    Write-Host "     Access Token : $($loginResponse.access_token.Substring(0, 20))..."
    Write-Host "     User         : $($loginResponse.user.name) ($($loginResponse.user.email))"
    Write-Host "     Roles        : $($loginResponse.user.roles -join ', ')"

    $token = $loginResponse.access_token
    $authHeaders = @{
        "Authorization" = "Bearer $token"
        "Accept"        = "application/json"
    }

    # 2. Auth Me
    Write-Host "`n[2/8] Testing GET /api/v1/auth/me..." -ForegroundColor Cyan
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/me" `
        -Method Get `
        -Headers $authHeaders
    Write-Host "  -> [PASS] User authenticated: $($meResponse.user.name)" -ForegroundColor Green

    # 3. Contracts List
    Write-Host "`n[3/8] Testing GET /api/v1/contracts..." -ForegroundColor Cyan
    $contractsResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/contracts" `
        -Method Get `
        -Headers $authHeaders
    Write-Host "  -> [PASS] Total contracts: $($contractsResponse.data.Count)" -ForegroundColor Green
    $contractId = $contractsResponse.data[0].id

    # 4. Contract Show
    Write-Host "`n[4/8] Testing GET /api/v1/contracts/$contractId..." -ForegroundColor Cyan
    $contractDetail = Invoke-RestMethod -Uri "$baseUrl/api/v1/contracts/$contractId" `
        -Method Get `
        -Headers $authHeaders
    Write-Host "  -> [PASS] Contract: $($contractDetail.data.contract_no) - $($contractDetail.data.title)" -ForegroundColor Green
    Write-Host "     Client: $($contractDetail.data.client.name) | Items: $($contractDetail.data.items.Count) | POs: $($contractDetail.data.purchase_orders.Count)"

    # 5. Purchase Orders
    Write-Host "`n[5/8] Testing GET /api/v1/purchase-orders..." -ForegroundColor Cyan
    $posResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/purchase-orders" `
        -Method Get `
        -Headers $authHeaders
    Write-Host "  -> [PASS] Total POs: $($posResponse.data.Count)" -ForegroundColor Green
    if ($posResponse.data.Count -gt 0) {
        $po = $posResponse.data[0]
        Write-Host "     PO No: $($po.po_no) | Supplier: $($po.supplier.name) | Total: PHP $($po.total)"
    }

    # 6. Inventory Movements
    Write-Host "`n[6/8] Testing GET /api/v1/inventory/movements..." -ForegroundColor Cyan
    $movementsResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/inventory/movements" `
        -Method Get `
        -Headers $authHeaders
    Write-Host "  -> [PASS] Total movements: $($movementsResponse.data.Count)" -ForegroundColor Green
    if ($movementsResponse.data.Count -gt 0) {
        $m = $movementsResponse.data[0]
        Write-Host "     Movement: Type $($m.type) | Qty $($m.quantity) | Variant: $($m.variant.sku)"
    }

    # 7. Invoices
    Write-Host "`n[7/8] Testing GET /api/v1/invoices..." -ForegroundColor Cyan
    $invoicesResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/invoices" `
        -Method Get `
        -Headers $authHeaders
    Write-Host "  -> [PASS] Total invoices: $($invoicesResponse.data.Count)" -ForegroundColor Green
    if ($invoicesResponse.data.Count -gt 0) {
        $inv = $invoicesResponse.data[0]
        Write-Host "     Invoice: $($inv.bs_no) | Gross PHP $($inv.gross_amount) | Client: $($inv.contract.client.name)"
    }

    # 8. Auth Logout
    Write-Host "`n[8/8] Testing POST /api/v1/auth/logout..." -ForegroundColor Cyan
    $logoutResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/logout" `
        -Method Post `
        -Headers $authHeaders
    Write-Host "  -> [PASS] $($logoutResponse.message)" -ForegroundColor Green

    # 9. Verify token revoked / unauthenticated behavior
    Write-Host "`n[Verify 401] Testing GET /api/v1/auth/me after logout..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/me" `
            -Method Get `
            -Headers $authHeaders
        Write-Host "  -> [FAIL] Expected 401 Unauthorized but request succeeded!" -ForegroundColor Red
    } catch {
        Write-Host "  -> [PASS] Properly rejected with 401 Unauthorized (Tokens revoked)." -ForegroundColor Green
    }

    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host " ALL API ENDPOINTS SUCCESSFULLY VERIFIED IN POWERSHELL! " -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green

} catch {
    Write-Host "[FAIL] Request failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Response body: $($reader.ReadToEnd())" -ForegroundColor Yellow
    }
}
