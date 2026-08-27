Add-Type -AssemblyName System.Net.Http
$client = New-Object System.Net.Http.HttpClient
$url = "http://localhost:8080/api/auth/register-admin"
$json = '{"name":"TestAdmin","email":"admin6@library.com","password":"password123","secretKey":"wrongkey"}'
$content = New-Object System.Net.Http.StringContent($json, [System.Text.Encoding]::UTF8, "application/json")

$tasks = @()
for ($i = 0; $i -lt 15; $i++) {
    $tasks += $client.PostAsync($url, $content)
}

[System.Threading.Tasks.Task]::WaitAll($tasks)

$results = $tasks | ForEach-Object { [int]$_.Result.StatusCode }
$results | Group-Object | Select-Object Count, Name
