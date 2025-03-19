#include <iostream>
#include <vector>

using namespace std;

int changeCoins(int N){
	vector<int> v = {1,2,5,10,20,50,100,200,500,1000};
	int m = v.size();
	int count = 0;
	for(int i = m - 1; i >= 0; i--){
		int k = N / v[i];
		N = N - k*v[i];
		count = count + k;
	}
	return count;
}
int main(){
	int T; cin >> T;
	while(T--){
		int N; cin >> N;
		cout << changeCoins(N) << endl;
	}
	return 0;
}