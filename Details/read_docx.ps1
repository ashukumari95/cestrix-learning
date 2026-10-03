param (
    [string]$path
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-DocxText($path) {
    if (-not (Test-Path $path)) {
        Write-Output "File not found: $path"
        return
    }
    
    $tempFolder = Join-Path $env:TEMP ([guid]::NewGuid().ToString())
    [System.IO.Compression.ZipFile]::ExtractToDirectory($path, $tempFolder)
    
    $documentXmlPath = Join-Path $tempFolder "word\document.xml"
    if (Test-Path $documentXmlPath) {
        $xml = [xml](Get-Content $documentXmlPath -Raw)
        $ns = new-object Xml.XmlNamespaceManager $xml.NameTable
        $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
        
        $paragraphs = $xml.SelectNodes("//w:p", $ns)
        foreach ($p in $paragraphs) {
            $texts = $p.SelectNodes(".//w:t", $ns)
            $paraText = ""
            foreach ($t in $texts) {
                $paraText += $t.InnerText
            }
            if ($paraText -ne "") {
                Write-Output $paraText
            }
        }
    }
    
    Remove-Item $tempFolder -Recurse -Force
}

Get-DocxText $path
