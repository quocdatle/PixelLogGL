Add-Type -AssemblyName System.Drawing

$itemsDir = Resolve-Path "frontend/src/assets/items"
$files = Get-ChildItem "$itemsDir\*.png"

foreach ($file in $files) {
    # Skip temporary files
    if ($file.Name.StartsWith(".")) { continue }

    $srcStream = [System.IO.File]::OpenRead($file.FullName)
    $srcImg = [System.Drawing.Image]::FromStream($srcStream)
    $w = $srcImg.Width
    $h = $srcImg.Height
    $srcStream.Close()
    $srcStream.Dispose()

    # If image is smaller than 256 in both dimensions
    if ($w -lt 256 -and $h -lt 256) {
        $maxDim = [Math]::Max($w, $h)
        $factor = [Math]::Floor(480 / $maxDim)
        if ($factor -lt 2) { $factor = 2 }

        $targetW = $w * $factor
        $targetH = $h * $factor

        # Canvas size 512x512
        $canvasSize = 512
        $bmp = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($bmp)

        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

        $posX = [Math]::Round(($canvasSize - $targetW) / 2)
        $posY = [Math]::Round(($canvasSize - $targetH) / 2)

        # Reload source to draw
        $srcStream = [System.IO.File]::OpenRead($file.FullName)
        $srcImg = [System.Drawing.Image]::FromStream($srcStream)
        $destRect = New-Object System.Drawing.Rectangle($posX, $posY, $targetW, $targetH)
        $g.DrawImage($srcImg, $destRect, 0, 0, $w, $h, [System.Drawing.GraphicsUnit]::Pixel)

        $srcStream.Close()
        $srcStream.Dispose()
        $srcImg.Dispose()
        $g.Dispose()

        $tempPath = "$($file.FullName).tmp"
        $bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()

        Move-Item -Path $tempPath -Destination $file.FullName -Force
        Write-Output "Upscaled $($file.Name): ${w}x${h} -> 512x512 (sprite ${targetW}x${targetH})"
    }
}

Write-Output "All small sprites processed successfully!"
