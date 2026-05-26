import UIKit

class AvatarView: UIView {
  private let label = UILabel()

  @objc var name: String? = "" {
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
    label.font = UIFont.boldSystemFont(ofSize: 18)
    label.textAlignment = .center
    label.translatesAutoresizingMaskIntoConstraints = false

    addSubview(label)

    NSLayoutConstraint.activate([
      label.centerXAnchor.constraint(equalTo: centerXAnchor),
      label.centerYAnchor.constraint(equalTo: centerYAnchor)
    ])
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    // Hacer la vista circular
    layer.cornerRadius = min(bounds.width, bounds.height) / 2
    layer.masksToBounds = true
  }

  private func updateView() {
    guard let name = name, !name.isEmpty else {
      label.text = "?"
      backgroundColor = .gray
      return
    }

    let words = name.trimmingCharacters(in: .whitespacesAndNewlines).components(separatedBy: .whitespaces)
    let initials: String
    if words.count >= 2 {
      initials = String(words[0].prefix(1) + words[1].prefix(1)).uppercased()
    } else {
      initials = String(name.prefix(2)).uppercased()
    }

    label.text = initials
    backgroundColor = generateColor(for: name)
  }

  private func generateColor(for text: String) -> UIColor {
    var hash = 0
    for char in text.unicodeScalars {
      hash = Int(char.value) &+ (hash << 5) &- hash
    }
    
    let hue = CGFloat(abs(hash) % 360) / 360.0
    return UIColor(hue: hue, saturation: 0.6, brightness: 0.9, alpha: 1.0)
  }
}
