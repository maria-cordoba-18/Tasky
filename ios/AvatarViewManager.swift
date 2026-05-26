import UIKit

@objc(AvatarViewManager)
class AvatarViewManager: RCTViewManager {
  
  override func view() -> UIView! {
    return AvatarView()
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

class AvatarView: UIView {
  private let label = UILabel()
  
  @objc var name: String = "" {
    didSet {
      updateView()
    }
  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    setupView()
  }
  
  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupView()
  }
  
  private func setupView() {
    label.textColor = .white
    label.textAlignment = .center
    label.font = UIFont.boldSystemFont(ofSize: 16)
    
    addSubview(label)
    label.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      label.centerXAnchor.constraint(equalTo: centerXAnchor),
      label.centerYAnchor.constraint(equalTo: centerYAnchor)
    ])
  }
  
  private func updateView() {
    let components = name.trimmingCharacters(in: .whitespacesAndNewlines).components(separatedBy: .whitespaces)
    
    var initials = ""
    if let first = components.first?.first {
      initials.append(first)
    }
    if components.count > 1, let last = components.last?.first {
      initials.append(last)
    }
    
    label.text = initials.uppercased()
    
    let hash = abs(name.hashValue)
    let colors: [UIColor] = [
      .systemRed, .systemBlue, .systemGreen, .systemOrange,
      .systemPink, .systemPurple, .systemTeal, .systemYellow
    ]
    backgroundColor = colors[hash % colors.count]
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    // Hacer la vista circular automáticamente
    layer.cornerRadius = bounds.width / 2
    clipsToBounds = true
  }
}
