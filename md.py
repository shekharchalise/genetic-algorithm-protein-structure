

def calculate_energy(residues = '', sequence = ''):
    assert(len(residues) != len(sequence))
    coordinates = generate_coords(sequence)
    energy = 0
    for x in range(len(residues)):
        for y in range(len(residues)):
            if (residues[x] == 'H' and residues[y] == 'H' and ((x - y) > 1 or (y - x) > 1)): #only h generate energy of -1 for now and not for nearby residues
                if (coordinates[x][0] - coordinates[y][0] == 1 and coordinates[x][1] == coordinates[y][1]) or (coordinates[y][0] - coordinates[x][0] == 1 and coordinates[x][1] == coordinates[y][1]) or (coordinates[x][1] - coordinates[y][1] == 1 and coordinates[x][0] == coordinates[y][0]) or (coordinates[y][0] - coordinates[x][0] == 1 and coordinates[x][0] == coordinates[y][0]):
                    energy -= 1
                    #print 'pujan'

    return energy / 2



def generate_coords(sequence = ' '):
    coordinates = []
    coord = [0, 0]
    coordinates.append([0, 0])
    #discard the first one since coordinates is always [0, 0]
    for x in sequence:
        if (x == 'R'):
            coord[0] += 1
        elif (x == 'L'):
            coord[0] -= 1
        elif (x == 'U'):
            coord[1] += 1
        elif (x == 'D'):
            coord[1] -= 1
        else:
            print("error")
            break
        coordinates.append([coord[0], coord[1]])
    return coordinates

def possible_next(residues = '', sequence = '', next = ''):
    chars = 'RLUD' #possible movements
    energies = []
    prev_coordinates = generate_coords(sequence)
    next_coordinates = []
    for x in chars:
        if (x == 'R'):
            next_coordinates.append([prev_coordinates[-1][0] + 1, prev_coordinates[-1][1] ])
        elif (x == 'L'):
            next_coordinates.append([prev_coordinates[-1][0] - 1, prev_coordinates[-1][1] ])
        elif (x == 'U'):
            next_coordinates.append([prev_coordinates[-1][0], prev_coordinates[-1][1] + 1])
        elif (x == 'D'):
            next_coordinates.append([prev_coordinates[-1][0], prev_coordinates[-1][1] - 1])
    print(next_coordinates)
    not_next = ''
    #print(chars)
    for x in range(len(next_coordinates)):
        for y in range(len(prev_coordinates)):
            if (next_coordinates[x] == prev_coordinates[y]):
                try:
                    #print("chars" , chars)
                    #print(len(chars))
                    #print(chars)
                    chars = chars.replace(chars[x], '')
                except Exception as e:
                    pass #already removed
    print(chars)
    return chars


import random

if __name__ == "__main__":
    #print calculate_energy('HPPHHPHPHP', 'RRRRUUUUL')
    #print possible_next("HPHPHP", "RULUL", "H")
    #print generate_coords("RULUL")
    sequences = "HPHPHPHPHPPPHHPHPPHPHPHPHPHPHPHPHPHPHPPHHHPPH"
    print(len(sequences))
    #start_seq = "HP"
    start_move = "R"
    for seq in range(1, len(sequences)-1):
        print(sequences[:seq], sequences[seq])
        next_moves = possible_next(sequences[:seq], start_move, sequences[seq])
        move = random.randint(0, len(next_moves) -1)
        # print(next_moves[move])
        start_move += next_moves[move]
        test = generate_coords(start_move)
        # print(test)
        # print(len(start_move), len(sequences[:seq]) )
        #print(start_move)

    # print(len(start_move), start_move))
    # test = generate_coords(start_move)
    # print(test)
