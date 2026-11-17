Add-Type -AssemblyName System.Drawing

function Rotate-Sword {
    param(
        [string]$name,
        [float]$angle
    )

    $srcPath = Resolve-Path "frontend/src/assets/items/$name"
    $srcStream = [System.IO.File]::OpenRead($srcPath)
    $src = [System.Drawing.Image]::FromStream($srcStream)
    $w = $src.Width
    $h = $src.Height
    $srcStream.Close()
    $srcStream.Dispose()

    $rad = [Math]::Abs($angle) * [Math]::PI / 180.0
    $boundW = [Math]::Ceiling($w * [Math]::Abs([Math]::Cos($rad)) + $h * [Math]::Abs([Math]::Sin($rad)))
    $boundH = [Math]::Ceiling($w * [Math]::Abs([Math]::Sin($rad)) + $h * [Math]::Abs([Math]::Cos($rad)))
    $newSize = [Math]::Max($boundW, $boundH)
    if ($newSize -gt 1600) { $newSize = 1600 }

    $bmp = New-Object System.Drawing.Bitmap($newSize, $newSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    $scale = $newSize / [Math]::Max($boundW, $boundH)
    if ($scale -gt 1.0) { $scale = 1.0 }

    $g.TranslateTransform($newSize / 2, $newSize / 2)
    $g.RotateTransform($angle)
    $g.ScaleTransform($scale, $scale)
    $g.TranslateTransform(-$w / 2, -$h / 2)

    $srcStream = [System.IO.File]::OpenRead($srcPath)
    $src = [System.Drawing.Image]::FromStream($srcStream)
    $g.DrawImage($src, 0, 0, $w, $h)

    $srcStream.Close()
    $srcStream.Dispose()
    $src.Dispose()
    $g.Dispose()

    $tempPath = "$srcPath.tmp"
    $bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    Move-Item -Path $tempPath -Destination $srcPath -Force
    Write-Output "Successfully rotated $name to diagonal (${newSize}x${newSize})!"
}

Rotate-Sword -name "frostmourne.png" -angle -45
Rotate-Sword -name "monado.png" -angle -45
Rotate-Sword -name "doom_slayers_crucible.png" -angle -45
Rotate-Sword -name "red_queen.png" -angle -45
Rotate-Sword -name "yamato.png" -angle -45

Write-Output "All vertical swords rotated to dynamic diagonal view!"
