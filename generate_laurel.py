import math

def generate_branch():
    # A single branch curving up and to the right
    path = []
    
    # Stem: curve from bottom (50, 190) to top (90, 20)
    stem = "M 45 190 Q 75 120 90 20 Q 80 120 50 190 Z"
    path.append(stem)
    
    # Leaves along the stem
    # We will generate leaves at t = 0.2, 0.4, 0.6, 0.8
    for i in range(1, 7):
        t = i / 7.0
        # rough quadratic bezier point for stem
        x = (1-t)**2 * 45 + 2*(1-t)*t * 75 + t**2 * 90
        y = (1-t)**2 * 190 + 2*(1-t)*t * 120 + t**2 * 20
        
        # tangent angle
        dx = 2*(1-t)*(75-45) + 2*t*(90-75)
        dy = 2*(1-t)*(120-190) + 2*t*(20-120)
        angle = math.atan2(dy, dx)
        
        # Left leaf
        l_angle = angle - 0.8
        lx = x + 30 * math.cos(l_angle)
        ly = y + 30 * math.sin(l_angle)
        # Control points for left leaf
        path.append(f"M {x:.1f} {y:.1f} Q {x - 20*math.sin(angle):.1f} {y + 20*math.cos(angle):.1f} {lx:.1f} {ly:.1f} Q {x - 10*math.sin(angle):.1f} {y + 10*math.cos(angle):.1f} {x:.1f} {y:.1f} Z")
        
        # Right leaf
        r_angle = angle + 0.8
        rx = x + 30 * math.cos(r_angle)
        ry = y + 30 * math.sin(r_angle)
        path.append(f"M {x:.1f} {y:.1f} Q {x + 20*math.sin(angle):.1f} {y - 20*math.cos(angle):.1f} {rx:.1f} {ry:.1f} Q {x + 10*math.sin(angle):.1f} {y - 10*math.cos(angle):.1f} {x:.1f} {y:.1f} Z")

    return " ".join(path)

print(generate_branch())
