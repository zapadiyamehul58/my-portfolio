$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx"

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    
    $content = $content -replace 'bg-slate-950/(10|20|30|40|50|60|70|80|90|95)', 'bg-bg-glass'
    $content = $content -replace 'bg-slate-900/(10|20|30|40|50|60|70|80|90|95)', 'bg-bg-glass'
    $content = $content -replace 'bg-slate-800/(10|20|30|40|50|60|70|80|90|95)', 'bg-bg-glass'
    
    $content = $content -replace 'bg-slate-950', 'bg-bg-primary'
    $content = $content -replace 'bg-slate-900', 'bg-bg-secondary'
    $content = $content -replace 'bg-slate-800', 'bg-bg-tertiary'
    
    $content = $content -replace 'text-slate-100', 'text-text-primary'
    $content = $content -replace 'text-slate-200', 'text-text-primary'
    $content = $content -replace 'text-slate-300', 'text-text-primary'
    
    $content = $content -replace 'text-slate-400', 'text-text-secondary'
    $content = $content -replace 'text-slate-500', 'text-text-secondary'
    $content = $content -replace 'text-slate-600', 'text-text-tertiary'
    $content = $content -replace 'text-slate-700', 'text-text-tertiary'
    
    $content = $content -replace 'border-slate-900/(10|20|30|40|50|60|70|80|90|95)', 'border-border-subtle'
    $content = $content -replace 'border-slate-800/(10|20|30|40|50|60|70|80|90|95)', 'border-border-subtle'
    $content = $content -replace 'border-slate-700/(10|20|30|40|50|60|70|80|90|95)', 'border-border-strong'
    
    $content = $content -replace 'border-slate-900', 'border-border-subtle'
    $content = $content -replace 'border-slate-800', 'border-border-subtle'
    $content = $content -replace 'border-slate-700', 'border-border-strong'
    
    $content = $content -replace 'text-white', 'text-text-primary'
    
    Set-Content $f.FullName -Value $content -NoNewline
}
