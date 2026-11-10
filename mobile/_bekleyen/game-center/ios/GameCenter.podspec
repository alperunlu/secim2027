Pod::Spec.new do |s|
  s.name           = 'GameCenter'
  s.version        = '1.0.0'
  s.summary        = 'Seçim 2027 Game Center köprüsü'
  s.description    = 'GameKit ile oturum açma, başarım ve skor tablosu gönderimi.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '15.1'
  }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'GameKit'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
